const { Hub, User, Inventory, Product, Order } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class HubController {
  // Create new hub
  static async createHub(req, res) {
    try {
      const {
        name,
        description,
        address,
        latitude,
        longitude,
        phone,
        operating_hours,
        hub_type
      } = req.body;

      // Only hub owners and admins can create hubs
      if (req.user.user_type !== 'hubowner' && req.user.user_type !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only hub owners can create hubs'
        });
      }

      const hub = await Hub.create({
        name,
        description,
        address,
        latitude,
        longitude,
        phone,
        operating_hours,
        hub_type,
        owner_id: req.user.id,
        is_active: true
      });

      logger.info(`New hub created: ${hub.name} by ${req.user.email}`);

      res.status(201).json({
        success: true,
        message: 'Hub created successfully',
        data: {
          hub: hub.toJSON()
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
        hub_type,
        is_active = true,
        latitude,
        longitude,
        radius = 50,
        sort = 'name',
        order = 'asc'
      } = req.query;

      let whereClause = {};
      
      if (is_active !== undefined) {
        whereClause.is_active = is_active === 'true';
      }

      if (hub_type) {
        whereClause.hub_type = hub_type;
      }

      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { address: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Location-based filtering
      if (latitude && longitude && radius) {
        const radiusInDegrees = radius / 111; // Convert km to degrees (approximate)
        whereClause.latitude = {
          [Op.between]: [
            parseFloat(latitude) - radiusInDegrees,
            parseFloat(latitude) + radiusInDegrees
          ]
        };
        whereClause.longitude = {
          [Op.between]: [
            parseFloat(longitude) - radiusInDegrees,
            parseFloat(longitude) + radiusInDegrees
          ]
        };
      }

      const hubs = await Hub.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'full_name', 'email', 'phone']
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
            attributes: ['id', 'full_name', 'email', 'phone']
          },
          {
            model: Inventory,
            as: 'inventory',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'description', 'category', 'base_price']
              }
            ]
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
          hub: hub.toJSON()
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
        description,
        address,
        latitude,
        longitude,
        phone,
        operating_hours,
        hub_type,
        is_active
      } = req.body;

      const hub = await Hub.findByPk(id);
      if (!hub) {
        return res.status(404).json({
          success: false,
          message: 'Hub not found'
        });
      }

      // Check if user can update this hub
      if (req.user.user_type !== 'admin' && req.user.id !== hub.owner_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own hubs.'
        });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (address !== undefined) updateData.address = address;
      if (latitude !== undefined) updateData.latitude = latitude;
      if (longitude !== undefined) updateData.longitude = longitude;
      if (phone !== undefined) updateData.phone = phone;
      if (operating_hours !== undefined) updateData.operating_hours = operating_hours;
      if (hub_type !== undefined) updateData.hub_type = hub_type;
      
      // Only admins can change is_active status
      if (is_active !== undefined && req.user.user_type === 'admin') {
        updateData.is_active = is_active;
      }

      await hub.update(updateData);

      logger.info(`Hub updated: ${hub.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Hub updated successfully',
        data: {
          hub: hub.toJSON()
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
      if (req.user.user_type !== 'admin' && req.user.id !== hub.owner_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only delete your own hubs.'
        });
      }

      // Check if hub has active orders
      const activeOrders = await Order.count({
        where: {
          [Op.or]: [
            { source_hub_id: id },
            { destination_hub_id: id }
          ],
          status: {
            [Op.in]: ['pending', 'confirmed', 'picked_up', 'in_transit']
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
      if (req.user.user_type !== 'admin' && req.user.id !== hub.owner_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view orders for your own hubs.'
        });
      }

      let whereClause = {
        [Op.or]: [
          { source_hub_id: id },
          { destination_hub_id: id }
        ]
      };

      if (status) {
        whereClause.status = status;
      }

      const orders = await Order.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['id', 'full_name', 'email', 'phone']
          },
          {
            model: User,
            as: 'courier',
            attributes: ['id', 'full_name', 'phone', 'vehicle_type']
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
      const userId = req.user.id;

      const hubs = await Hub.findAll({
        where: { owner_id: userId },
        include: [
          {
            model: Inventory,
            as: 'inventory',
            attributes: ['id', 'product_id', 'quantity', 'low_stock_threshold'],
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'category']
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
