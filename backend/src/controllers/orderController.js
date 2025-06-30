const { Order, OrderItem, User, Hub, Product, Inventory } = require('../models');
const logger = require('../utils/logger');
const { Op, sequelize } = require('sequelize');
const { sendOrderNotification, sendDeliveryAssignment } = require('../services/emailService');

class OrderController {
  // Create new order
  static async createOrder(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const {
        delivery_address,
        delivery_latitude,
        delivery_longitude,
        delivery_instructions,
        items, // [{ product_id, quantity, hub_id }]
        preferred_delivery_time
      } = req.body;

      const customer = req.user;

      // Validate items and check inventory
      let totalAmount = 0;
      const validatedItems = [];
      
      for (const item of items) {
        const { product_id, quantity, hub_id } = item;

        // Check if product exists and get its details
        const product = await Product.findByPk(product_id);
        if (!product || !product.is_active) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Product ${product_id} not found or inactive`
          });
        }

        // Check if hub exists and is active
        const hub = await Hub.findByPk(hub_id);
        if (!hub || !hub.is_active) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Hub ${hub_id} not found or inactive`
          });
        }

        // Check inventory availability
        const inventory = await Inventory.findOne({
          where: { product_id, hub_id },
          transaction
        });

        if (!inventory || inventory.quantity < quantity) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Insufficient inventory for ${product.name} at ${hub.name}. Available: ${inventory?.quantity || 0}, Requested: ${quantity}`
          });
        }

        // Calculate item cost
        const itemPrice = inventory.price || product.base_price;
        const itemTotal = itemPrice * quantity;
        totalAmount += itemTotal;

        validatedItems.push({
          product_id,
          quantity,
          unit_price: itemPrice,
          total_price: itemTotal,
          hub_id
        });

        // Reserve inventory (reduce quantity)
        await inventory.update(
          { quantity: inventory.quantity - quantity },
          { transaction }
        );
      }

      // Find optimal source hub (for now, use the first hub from items)
      const sourceHubId = items[0].hub_id;

      // Create order
      const order = await Order.create({
        customer_id: customer.id,
        source_hub_id: sourceHubId,
        delivery_address,
        delivery_latitude,
        delivery_longitude,
        delivery_instructions,
        total_amount: totalAmount,
        status: 'pending',
        preferred_delivery_time
      }, { transaction });

      // Create order items
      const orderItems = await Promise.all(
        validatedItems.map(item => 
          OrderItem.create({
            order_id: order.id,
            ...item
          }, { transaction })
        )
      );

      await transaction.commit();

      // Send order confirmation email
      try {
        await sendOrderNotification(customer.email, customer.full_name, {
          id: order.id,
          status: 'confirmed',
          total_amount: totalAmount
        });
      } catch (emailError) {
        logger.error('Failed to send order confirmation email:', emailError);
      }

      // Emit real-time event
      const socketManager = req.app.get('socketManager');
      if (socketManager) {
        socketManager.emitToRoom(`user_${customer.id}`, 'order_created', {
          order_id: order.id,
          status: 'pending',
          total_amount: totalAmount
        });
      }

      logger.info(`Order created: ${order.id} by ${customer.email} - $${totalAmount}`);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          order: {
            ...order.toJSON(),
            orderItems
          }
        }
      });

    } catch (error) {
      await transaction.rollback();
      logger.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get order by ID
  static async getOrderById(req, res) {
    try {
      const { id } = req.params;

      const order = await Order.findByPk(id, {
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['id', 'full_name', 'email', 'phone']
          },
          {
            model: User,
            as: 'courier',
            attributes: ['id', 'full_name', 'phone', 'vehicle_type', 'rating']
          },
          {
            model: Hub,
            as: 'sourceHub',
            attributes: ['id', 'name', 'address', 'latitude', 'longitude']
          },
          {
            model: Hub,
            as: 'destinationHub',
            attributes: ['id', 'name', 'address', 'latitude', 'longitude']
          },
          {
            model: OrderItem,
            as: 'orderItems',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'description', 'category']
              }
            ]
          }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check if user can access this order
      const canAccess = 
        req.user.user_type === 'admin' ||
        req.user.id === order.customer_id ||
        req.user.id === order.courier_id ||
        (req.user.user_type === 'hubowner' && 
         (req.user.id === order.sourceHub?.owner_id || 
          req.user.id === order.destinationHub?.owner_id));

      if (!canAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own orders.'
        });
      }

      res.json({
        success: true,
        message: 'Order retrieved successfully',
        data: {
          order: order.toJSON()
        }
      });

    } catch (error) {
      logger.error('Get order by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve order',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update order status
  static async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, courier_notes, estimated_delivery_time } = req.body;

      const order = await Order.findByPk(id, {
        include: [
          { model: User, as: 'customer' },
          { model: User, as: 'courier' }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check permissions based on status change
      const canUpdate = 
        req.user.user_type === 'admin' ||
        (req.user.user_type === 'courier' && req.user.id === order.courier_id) ||
        (req.user.user_type === 'hubowner' && ['confirmed', 'ready_for_pickup'].includes(status));

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You cannot update this order status.'
        });
      }

      // Validate status transitions
      const validTransitions = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['ready_for_pickup', 'cancelled'],
        'ready_for_pickup': ['picked_up', 'cancelled'],
        'picked_up': ['in_transit'],
        'in_transit': ['delivered', 'failed'],
        'delivered': [],
        'cancelled': [],
        'failed': ['pending'] // Allow retry
      };

      if (!validTransitions[order.status]?.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot change status from ${order.status} to ${status}`
        });
      }

      // Update order
      const updateData = { status };
      if (courier_notes) updateData.courier_notes = courier_notes;
      if (estimated_delivery_time) updateData.estimated_delivery_time = estimated_delivery_time;

      // Set delivery timestamp for completed orders
      if (status === 'delivered') {
        updateData.delivered_at = new Date();
        
        // Update courier stats
        if (order.courier) {
          await order.courier.update({
            total_deliveries: order.courier.total_deliveries + 1
          });
        }
      }

      await order.update(updateData);

      // Send status update notifications
      try {
        await sendOrderNotification(order.customer.email, order.customer.full_name, {
          id: order.id,
          status,
          total_amount: order.total_amount
        });
      } catch (emailError) {
        logger.error('Failed to send status update email:', emailError);
      }

      // Emit real-time status update
      const socketManager = req.app.get('socketManager');
      if (socketManager) {
        socketManager.emitToRoom(`user_${order.customer_id}`, 'order_status_updated', {
          order_id: order.id,
          status,
          updated_at: new Date()
        });

        if (order.courier_id) {
          socketManager.emitToRoom(`user_${order.courier_id}`, 'order_status_updated', {
            order_id: order.id,
            status,
            updated_at: new Date()
          });
        }
      }

      logger.info(`Order ${order.id} status updated to ${status} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: {
          order: order.toJSON()
        }
      });

    } catch (error) {
      logger.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update order status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Assign courier to order
  static async assignCourier(req, res) {
    try {
      const { id } = req.params;
      const { courier_id } = req.body;

      const order = await Order.findByPk(id, {
        include: [
          { model: Hub, as: 'sourceHub', include: [{ model: User, as: 'owner' }] }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check if user can assign courier
      const canAssign = 
        req.user.user_type === 'admin' ||
        (req.user.user_type === 'hubowner' && req.user.id === order.sourceHub?.owner_id);

      if (!canAssign) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only hub owners can assign couriers.'
        });
      }

      // Validate courier
      const courier = await User.findOne({
        where: {
          id: courier_id,
          user_type: 'courier',
          is_active: true,
          is_available: true
        }
      });

      if (!courier) {
        return res.status(400).json({
          success: false,
          message: 'Courier not found or not available'
        });
      }

      // Update order with courier assignment
      await order.update({ 
        courier_id,
        status: order.status === 'pending' ? 'confirmed' : order.status
      });

      // Send assignment notification to courier
      try {
        await sendDeliveryAssignment(courier.email, courier.full_name, {
          id: order.id,
          pickup_address: order.sourceHub?.address,
          delivery_address: order.delivery_address,
          total_amount: order.total_amount
        });
      } catch (emailError) {
        logger.error('Failed to send courier assignment email:', emailError);
      }

      // Emit real-time assignment notification
      const socketManager = req.app.get('socketManager');
      if (socketManager) {
        socketManager.emitToRoom(`user_${courier_id}`, 'delivery_assigned', {
          order_id: order.id,
          pickup_address: order.sourceHub?.address,
          delivery_address: order.delivery_address,
          total_amount: order.total_amount
        });
      }

      logger.info(`Courier ${courier_id} assigned to order ${order.id} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Courier assigned successfully',
        data: {
          order: order.toJSON(),
          courier: {
            id: courier.id,
            full_name: courier.full_name,
            phone: courier.phone,
            vehicle_type: courier.vehicle_type
          }
        }
      });

    } catch (error) {
      logger.error('Assign courier error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign courier',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get orders with pagination and filtering
  static async getOrders(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        customer_id,
        courier_id,
        hub_id,
        start_date,
        end_date,
        sort = 'created_at',
        order = 'desc'
      } = req.query;

      let whereClause = {};

      // Apply filters based on user role
      if (req.user.user_type === 'customer') {
        whereClause.customer_id = req.user.id;
      } else if (req.user.user_type === 'courier') {
        whereClause.courier_id = req.user.id;
      } else if (req.user.user_type === 'hubowner') {
        // Hub owners can see orders from their hubs
        const userHubs = await Hub.findAll({
          where: { owner_id: req.user.id },
          attributes: ['id']
        });
        const hubIds = userHubs.map(hub => hub.id);
        
        whereClause[Op.or] = [
          { source_hub_id: { [Op.in]: hubIds } },
          { destination_hub_id: { [Op.in]: hubIds } }
        ];
      }

      // Additional filters (only for admin and authorized users)
      if (req.user.user_type === 'admin') {
        if (status) whereClause.status = status;
        if (customer_id) whereClause.customer_id = customer_id;
        if (courier_id) whereClause.courier_id = courier_id;
        if (hub_id) {
          whereClause[Op.or] = [
            { source_hub_id: hub_id },
            { destination_hub_id: hub_id }
          ];
        }
      }

      // Date range filter
      if (start_date || end_date) {
        whereClause.created_at = {};
        if (start_date) whereClause.created_at[Op.gte] = new Date(start_date);
        if (end_date) whereClause.created_at[Op.lte] = new Date(end_date);
      }

      const orders = await Order.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['id', 'full_name', 'email']
          },
          {
            model: User,
            as: 'courier',
            attributes: ['id', 'full_name', 'phone', 'vehicle_type']
          },
          {
            model: Hub,
            as: 'sourceHub',
            attributes: ['id', 'name', 'address']
          },
          {
            model: OrderItem,
            as: 'orderItems',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'category']
              }
            ]
          }
        ],
        order: [[sort, order.toUpperCase()]],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      res.json({
        success: true,
        message: 'Orders retrieved successfully',
        data: {
          orders: orders.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: orders.count,
            pages: Math.ceil(orders.count / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Get orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve orders',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Cancel order
  static async cancelOrder(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { cancellation_reason } = req.body;

      const order = await Order.findByPk(id, {
        include: [
          { model: OrderItem, as: 'orderItems' },
          { model: User, as: 'customer' }
        ],
        transaction
      });

      if (!order) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check if user can cancel this order
      const canCancel = 
        req.user.user_type === 'admin' ||
        (req.user.id === order.customer_id && ['pending', 'confirmed'].includes(order.status));

      if (!canCancel) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'Cannot cancel this order. Order may have already been picked up.'
        });
      }

      // Restore inventory for cancelled orders
      for (const item of order.orderItems) {
        const inventory = await Inventory.findOne({
          where: {
            product_id: item.product_id,
            hub_id: item.hub_id
          },
          transaction
        });

        if (inventory) {
          await inventory.update(
            { quantity: inventory.quantity + item.quantity },
            { transaction }
          );
        }
      }

      // Update order status
      await order.update({
        status: 'cancelled',
        cancelled_at: new Date(),
        cancellation_reason
      }, { transaction });

      await transaction.commit();

      logger.info(`Order ${order.id} cancelled by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: {
          order: order.toJSON()
        }
      });

    } catch (error) {
      await transaction.rollback();
      logger.error('Cancel order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel order',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = OrderController;
