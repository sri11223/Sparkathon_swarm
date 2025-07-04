const { Order, User, Hub, Delivery, CourierVehicle } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class RouteController {
  // Get optimized routes for courier
  static async getOptimizedRoutes(req, res) {
    try {
      const { hub_id, max_orders = 10, max_distance = 50 } = req.query;
      
      // Get pending orders for the hub or courier
      let whereClause = {};
      
      if (req.user.role === 'courier') {
        whereClause = {
          courier_id: req.user.user_id,
          status: ['confirmed', 'ready_for_pickup', 'picked_up']
        };
      } else if (hub_id) {
        whereClause = {
          hub_id: hub_id,
          status: ['confirmed', 'ready_for_pickup'],
          courier_id: { [Op.not]: null }
        };
      } else {
        return res.status(400).json({
          success: false,
          message: 'Hub ID required for non-courier users'
        });
      }

      const orders = await Order.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['first_name', 'last_name', 'phone_number']
          },
          {
            model: Hub,
            as: 'hub',
            attributes: ['name', 'address', 'location']
          }
        ],
        limit: parseInt(max_orders),
        order: [['created_at', 'ASC']]
      });

      // Mock optimization algorithm (in real implementation, this would use Google Maps API)
      const optimizedRoute = orders.map((order, index) => ({
        order_id: order.order_id,
        sequence: index + 1,
        customer_name: `${order.customer.first_name} ${order.customer.last_name}`,
        delivery_address: order.delivery_address,
        phone_number: order.customer.phone_number,
        estimated_duration: 15 + (index * 5), // Mock duration
        distance_from_previous: index === 0 ? 0 : Math.random() * 5, // Mock distance
        delivery_window: {
          start: new Date(Date.now() + (index * 30 * 60000)), // 30 min intervals
          end: new Date(Date.now() + ((index + 1) * 30 * 60000))
        }
      }));

      const totalDistance = optimizedRoute.reduce((sum, stop) => sum + stop.distance_from_previous, 0);
      const totalDuration = optimizedRoute.reduce((sum, stop) => sum + stop.estimated_duration, 0);

      res.json({
        success: true,
        message: 'Optimized route generated successfully',
        data: {
          route: optimizedRoute,
          summary: {
            total_orders: orders.length,
            total_distance: Math.round(totalDistance * 100) / 100,
            estimated_total_time: totalDuration,
            start_location: orders[0]?.hub?.name || 'Hub',
            optimization_time: new Date().toISOString()
          }
        }
      });

    } catch (error) {
      logger.error('Get optimized routes error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to optimize routes',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update route status
  static async updateRouteStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, current_location, notes } = req.body;

      // Find the order (route is associated with orders)
      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Verify courier permission
      if (req.user.role === 'courier' && order.courier_id !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update routes for your assigned orders'
        });
      }

      // Update order status based on route status
      let orderStatus = order.status;
      switch (status) {
        case 'started':
          orderStatus = 'picked_up';
          break;
        case 'in_progress':
          orderStatus = 'in_transit';
          break;
        case 'completed':
          orderStatus = 'delivered';
          break;
        case 'delayed':
          // Keep current status but add notes
          break;
      }

      await order.update({
        status: orderStatus,
        courier_notes: notes || order.courier_notes,
        updated_at: new Date()
      });

      // Update delivery record if exists
      const delivery = await Delivery.findOne({ where: { order_id: id } });
      if (delivery) {
        await delivery.update({
          status: status === 'completed' ? 'completed' : 'in_progress',
          current_location: current_location,
          notes: notes,
          delivered_at: status === 'completed' ? new Date() : null
        });
      }

      logger.info(`Route status updated for order ${id}: ${status} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Route status updated successfully',
        data: {
          order_id: id,
          status: status,
          order_status: orderStatus,
          updated_at: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Update route status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update route status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = RouteController;
