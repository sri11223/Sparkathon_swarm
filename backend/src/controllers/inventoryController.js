const { Inventory, Product, Hub, User } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class InventoryController {
  // Add product to hub inventory
  static async addInventory(req, res) {
    try {
      const {
        hub_id,
        product_id,
        quantity,
        price,
        low_stock_threshold = 10
      } = req.body;

      // Verify hub exists and user has access
      const hub = await Hub.findByPk(hub_id);
      if (!hub) {
        return res.status(404).json({
          success: false,
          message: 'Hub not found'
        });
      }

      // Check if user can manage this hub's inventory
      if (req.user.user_type !== 'admin' && req.user.id !== hub.owner_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only manage inventory for your own hubs.'
        });
      }

      // Verify product exists
      const product = await Product.findByPk(product_id);
      if (!product || !product.is_active) {
        return res.status(404).json({
          success: false,
          message: 'Product not found or inactive'
        });
      }

      // Check if inventory entry already exists
      let inventory = await Inventory.findOne({
        where: { hub_id, product_id }
      });

      if (inventory) {
        // Update existing inventory
        await inventory.update({
          quantity: inventory.quantity + quantity,
          price: price || inventory.price,
          low_stock_threshold
        });
      } else {
        // Create new inventory entry
        inventory = await Inventory.create({
          hub_id,
          product_id,
          quantity,
          price: price || product.base_price,
          low_stock_threshold
        });
      }

      // Get updated inventory with product details
      const updatedInventory = await Inventory.findByPk(inventory.id, {
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'description', 'category', 'base_price']
          },
          {
            model: Hub,
            as: 'hub',
            attributes: ['id', 'name', 'address']
          }
        ]
      });

      logger.info(`Inventory updated: ${product.name} at ${hub.name} by ${req.user.email}`);

      res.status(inventory ? 200 : 201).json({
        success: true,
        message: inventory ? 'Inventory updated successfully' : 'Inventory added successfully',
        data: {
          inventory: updatedInventory.toJSON()
        }
      });

    } catch (error) {
      logger.error('Add inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add inventory',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update inventory quantity and settings
  static async updateInventory(req, res) {
    try {
      const { id } = req.params;
      const {
        quantity,
        price,
        low_stock_threshold
      } = req.body;

      const inventory = await Inventory.findByPk(id, {
        include: [
          {
            model: Hub,
            as: 'hub',
            attributes: ['id', 'name', 'owner_id']
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Inventory entry not found'
        });
      }

      // Check if user can update this inventory
      if (req.user.user_type !== 'admin' && req.user.id !== inventory.hub.owner_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update inventory for your own hubs.'
        });
      }

      const updateData = {};
      if (quantity !== undefined) updateData.quantity = quantity;
      if (price !== undefined) updateData.price = price;
      if (low_stock_threshold !== undefined) updateData.low_stock_threshold = low_stock_threshold;

      await inventory.update(updateData);

      logger.info(`Inventory updated: ${inventory.product.name} at ${inventory.hub.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Inventory updated successfully',
        data: {
          inventory: inventory.toJSON()
        }
      });

    } catch (error) {
      logger.error('Update inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update inventory',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get inventory by ID
  static async getInventoryById(req, res) {
    try {
      const { id } = req.params;

      const inventory = await Inventory.findByPk(id, {
        include: [
          {
            model: Product,
            as: 'product'
          },
          {
            model: Hub,
            as: 'hub',
            attributes: ['id', 'name', 'address', 'owner_id']
          }
        ]
      });

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Inventory entry not found'
        });
      }

      // Check if user can view this inventory
      const canView = 
        req.user.user_type === 'admin' ||
        req.user.id === inventory.hub.owner_id ||
        req.user.user_type === 'customer'; // Customers can view for shopping

      if (!canView) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        message: 'Inventory retrieved successfully',
        data: {
          inventory: inventory.toJSON()
        }
      });

    } catch (error) {
      logger.error('Get inventory by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve inventory',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Remove inventory entry
  static async removeInventory(req, res) {
    try {
      const { id } = req.params;

      const inventory = await Inventory.findByPk(id, {
        include: [
          {
            model: Hub,
            as: 'hub',
            attributes: ['id', 'name', 'owner_id']
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Inventory entry not found'
        });
      }

      // Check if user can remove this inventory
      if (req.user.user_type !== 'admin' && req.user.id !== inventory.hub.owner_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only remove inventory for your own hubs.'
        });
      }

      await inventory.destroy();

      logger.info(`Inventory removed: ${inventory.product.name} from ${inventory.hub.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Inventory entry removed successfully'
      });

    } catch (error) {
      logger.error('Remove inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove inventory',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get low stock alerts
  static async getLowStockAlerts(req, res) {
    try {
      const { hub_id } = req.query;

      let whereClause = {
        quantity: {
          [Op.lte]: { [Op.col]: 'low_stock_threshold' }
        }
      };

      // Filter by hub for hub owners
      if (req.user.user_type === 'hubowner') {
        const userHubs = await Hub.findAll({
          where: { owner_id: req.user.id },
          attributes: ['id']
        });
        const hubIds = userHubs.map(hub => hub.id);
        whereClause.hub_id = { [Op.in]: hubIds };
      } else if (hub_id) {
        whereClause.hub_id = hub_id;
      }

      const lowStockItems = await Inventory.findAll({
        where: whereClause,
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'category']
          },
          {
            model: Hub,
            as: 'hub',
            attributes: ['id', 'name', 'address']
          }
        ],
        order: [['quantity', 'ASC']]
      });

      res.json({
        success: true,
        message: 'Low stock alerts retrieved successfully',
        data: {
          alerts: lowStockItems,
          count: lowStockItems.length
        }
      });

    } catch (error) {
      logger.error('Get low stock alerts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve low stock alerts',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get inventory summary for hub owner dashboard
  static async getInventorySummary(req, res) {
    try {
      let hubCondition = {};

      // Filter by user's hubs if hub owner
      if (req.user.user_type === 'hubowner') {
        hubCondition.owner_id = req.user.id;
      }

      const summary = await Inventory.findAll({
        attributes: [
          [Inventory.sequelize.fn('COUNT', Inventory.sequelize.col('Inventory.id')), 'total_items'],
          [Inventory.sequelize.fn('SUM', Inventory.sequelize.col('quantity')), 'total_quantity'],
          [Inventory.sequelize.fn('AVG', Inventory.sequelize.col('quantity')), 'avg_quantity'],
          [
            Inventory.sequelize.fn('COUNT', 
              Inventory.sequelize.literal(
                'CASE WHEN quantity <= low_stock_threshold THEN 1 END'
              )
            ), 
            'low_stock_count'
          ]
        ],
        include: [
          {
            model: Hub,
            as: 'hub',
            where: hubCondition,
            attributes: []
          }
        ],
        raw: true
      });

      // Get category breakdown
      const categoryBreakdown = await Inventory.findAll({
        attributes: [
          [Inventory.sequelize.col('product.category'), 'category'],
          [Inventory.sequelize.fn('COUNT', Inventory.sequelize.col('Inventory.id')), 'count'],
          [Inventory.sequelize.fn('SUM', Inventory.sequelize.col('quantity')), 'total_quantity']
        ],
        include: [
          {
            model: Product,
            as: 'product',
            attributes: []
          },
          {
            model: Hub,
            as: 'hub',
            where: hubCondition,
            attributes: []
          }
        ],
        group: ['product.category'],
        raw: true
      });

      res.json({
        success: true,
        message: 'Inventory summary retrieved successfully',
        data: {
          summary: summary[0] || {
            total_items: 0,
            total_quantity: 0,
            avg_quantity: 0,
            low_stock_count: 0
          },
          category_breakdown: categoryBreakdown
        }
      });

    } catch (error) {
      logger.error('Get inventory summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve inventory summary',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Bulk update inventory (for CSV imports, etc.)
  static async bulkUpdateInventory(req, res) {
    try {
      const { hub_id, updates } = req.body; // updates: [{ product_id, quantity, price }]

      // Verify hub exists and user has access
      const hub = await Hub.findByPk(hub_id);
      if (!hub) {
        return res.status(404).json({
          success: false,
          message: 'Hub not found'
        });
      }

      if (req.user.user_type !== 'admin' && req.user.id !== hub.owner_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const results = [];
      
      for (const update of updates) {
        try {
          const { product_id, quantity, price } = update;

          // Verify product exists
          const product = await Product.findByPk(product_id);
          if (!product) {
            results.push({
              product_id,
              success: false,
              message: 'Product not found'
            });
            continue;
          }

          // Find or create inventory entry
          let inventory = await Inventory.findOne({
            where: { hub_id, product_id }
          });

          if (inventory) {
            await inventory.update({
              quantity,
              price: price || inventory.price
            });
          } else {
            inventory = await Inventory.create({
              hub_id,
              product_id,
              quantity,
              price: price || product.base_price,
              low_stock_threshold: 10
            });
          }

          results.push({
            product_id,
            success: true,
            message: 'Updated successfully'
          });

        } catch (error) {
          results.push({
            product_id: update.product_id,
            success: false,
            message: error.message
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      logger.info(`Bulk inventory update: ${successCount} successful, ${failureCount} failed by ${req.user.email}`);

      res.json({
        success: true,
        message: `Bulk update completed: ${successCount} successful, ${failureCount} failed`,
        data: {
          results,
          summary: {
            total: results.length,
            successful: successCount,
            failed: failureCount
          }
        }
      });

    } catch (error) {
      logger.error('Bulk update inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk update inventory',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = InventoryController;
