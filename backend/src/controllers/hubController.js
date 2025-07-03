const { Hub, User, Inventory, Product, Order } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class HubController {
  // Create new hub
  static async createHub(req, res) {
    try {
      const {
        name,
        address,
        latitude,
        longitude,
        capacity_m3 = 100.0,
        description
      } = req.body;

      // Only hub owners and admins can create hubs
      if (req.user.role !== 'hub_owner' && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only hub owners can create hubs'
        });
      }

      const hub = await Hub.create({
        name,
        address,
        location: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        capacity_m3: parseFloat(capacity_m3),
        current_utilization_m3: 0,
        status: 'active',
        owner_id: req.user.user_id,
        description
      });

      logger.info(`New hub created: ${hub.name} by ${req.user.email}`);

      res.status(201).json({
        success: true,
        message: 'Hub created successfully',
        data: {
          hub: {
            hub_id: hub.hub_id,
            name: hub.name,
            address: hub.address,
            location: hub.location,
            capacity_m3: hub.capacity_m3,
            current_utilization_m3: hub.current_utilization_m3,
            status: hub.status,
            owner_id: hub.owner_id,
            description: hub.description,
            created_at: hub.created_at,
            updated_at: hub.updated_at
          }
        }
      });

    } catch (error) {
      logger.error('Create hub error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create hub',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get all hubs with pagination and filtering
  static async getAllHubs(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        latitude,
        longitude,
        radius = 50,
        sort = 'name',
        order = 'asc'
      } = req.query;

      let whereClause = {};
      
      if (status) {
        whereClause.status = status;
      } else {
        // By default, only show active hubs
        whereClause.status = 'active';
      }

      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { address: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // TODO: Location-based filtering would require PostGIS functionality
      // For now, we'll skip the geographic filtering

      const hubs = await Hub.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['user_id', 'first_name', 'last_name', 'email']
          }
        ],
        order: [[sort, order.toUpperCase()]],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      res.json({
        success: true,
        message: 'Hubs retrieved successfully',
        data: {
          hubs: hubs.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: hubs.count,
            pages: Math.ceil(hubs.count / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Get all hubs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve hubs',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get hub by ID
  static async getHubById(req, res) {
    try {
      const { id } = req.params;

      const hub = await Hub.findByPk(id, {
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['user_id', 'first_name', 'last_name', 'email']
          }
        ]
      });

      if (!hub) {
        return res.status(404).json({
          success: false,
          message: 'Hub not found'
        });
      }

      res.json({
        success: true,
        message: 'Hub retrieved successfully',
        data: {
          hub: {
            hub_id: hub.hub_id,
            name: hub.name,
            address: hub.address,
            location: hub.location,
            capacity_m3: hub.capacity_m3,
            current_utilization_m3: hub.current_utilization_m3,
            status: hub.status,
            owner_id: hub.owner_id,
            description: hub.description,
            created_at: hub.created_at,
            updated_at: hub.updated_at,
            owner: hub.owner
          }
        }
      });

    } catch (error) {
      logger.error('Get hub by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve hub',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update hub
  static async updateHub(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        address,
        latitude,
        longitude,
        capacity_m3,
        status
      } = req.body;

      const hub = await Hub.findByPk(id);
      if (!hub) {
        return res.status(404).json({
          success: false,
          message: 'Hub not found'
        });
      }

      // Check if user can update this hub
      if (req.user.role !== 'admin' && req.user.user_id !== hub.owner_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own hubs.'
        });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (address !== undefined) updateData.address = address;
      if (capacity_m3 !== undefined) updateData.capacity_m3 = parseFloat(capacity_m3);
      
      // Handle location update
      if (latitude !== undefined && longitude !== undefined) {
        updateData.location = {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        };
      }
      
      // Only admins can change status
      if (status !== undefined && req.user.role === 'admin') {
        updateData.status = status;
      }

      await hub.update(updateData);

      logger.info(`Hub updated: ${hub.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Hub updated successfully',
        data: {
          hub: {
            hub_id: hub.hub_id,
            name: hub.name,
            address: hub.address,
            location: hub.location,
            capacity_m3: hub.capacity_m3,
            current_utilization_m3: hub.current_utilization_m3,
            status: hub.status,
            owner_id: hub.owner_id,
            description: hub.description,
            created_at: hub.created_at,
            updated_at: hub.updated_at
          }
        }
      });

    } catch (error) {
      logger.error('Update hub error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update hub',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete hub
  static async deleteHub(req, res) {
    try {
      const { id } = req.params;

      const hub = await Hub.findByPk(id);
      if (!hub) {
        return res.status(404).json({
          success: false,
          message: 'Hub not found'
        });
      }

      // Check if user can delete this hub
      if (req.user.role !== 'admin' && req.user.user_id !== hub.owner_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only delete your own hubs.'
        });
      }

      // Check if hub has active orders
      const activeOrders = await Order.count({
        where: {
          hub_id: id,
          status: {
            [Op.in]: ['pending', 'confirmed', 'ready_for_pickup', 'picked_up', 'in_transit']
          }
        }
      });

      if (activeOrders > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete hub with active orders. Please complete or cancel all active orders first.'
        });
      }

      await hub.destroy();

      logger.info(`Hub deleted: ${hub.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Hub deleted successfully'
      });

    } catch (error) {
      logger.error('Delete hub error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete hub',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get hub inventory
  static async getHubInventory(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, category, search, low_stock } = req.query;

      const hub = await Hub.findByPk(id);
      if (!hub) {
        return res.status(404).json({
          success: false,
          message: 'Hub not found'
        });
      }

      let inventoryWhere = { hub_id: id };
      let productWhere = {};

      if (category) {
        productWhere.category = category;
      }

      if (search) {
        productWhere[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (low_stock === 'true') {
        inventoryWhere[Op.and] = [
          { quantity: { [Op.lte]: { [Op.col]: 'low_stock_threshold' } } }
        ];
      }

      const inventory = await Inventory.findAndCountAll({
        where: inventoryWhere,
        include: [
          {
            model: Product,
            as: 'product',
            where: productWhere,
            required: true
          }
        ],
        order: [['updated_at', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      res.json({
        success: true,
        message: 'Hub inventory retrieved successfully',
        data: {
          hub_id: id,
          hub_name: hub.name,
          inventory: inventory.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: inventory.count,
            pages: Math.ceil(inventory.count / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Get hub inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve hub inventory',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get hub orders
  static async getHubOrders(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10, status, sort = 'desc' } = req.query;

      const hub = await Hub.findByPk(id);
      if (!hub) {
        return res.status(404).json({
          success: false,
          message: 'Hub not found'
        });
      }

      // Check if user can access hub orders
      if (req.user.role !== 'admin' && req.user.user_id !== hub.owner_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view orders for your own hubs.'
        });
      }

      let whereClause = { hub_id: id };

      if (status) {
        whereClause.status = status;
      }

      const orders = await Order.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['user_id', 'first_name', 'last_name', 'email', 'phone_number']
          },
          {
            model: User,
            as: 'courier',
            attributes: ['user_id', 'first_name', 'last_name', 'phone_number']
          }
        ],
        order: [['created_at', sort.toUpperCase()]],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      res.json({
        success: true,
        message: 'Hub orders retrieved successfully',
        data: {
          hub_id: id,
          hub_name: hub.name,
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
      logger.error('Get hub orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve hub orders',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get user's hubs (for hub owners)
  static async getUserHubs(req, res) {
    try {
      const userId = req.user.user_id;

      const hubs = await Hub.findAll({
        where: { owner_id: userId },
        include: [
          {
            model: Inventory,
            as: 'inventory',
            attributes: ['inventory_id', 'product_id', 'quantity', 'low_stock_threshold'],
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['product_id', 'name', 'category']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        message: 'User hubs retrieved successfully',
        data: {
          hubs,
          count: hubs.length
        }
      });

    } catch (error) {
      logger.error('Get user hubs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user hubs',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = HubController;
