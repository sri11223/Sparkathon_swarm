const { User, Hub, Order, Product, Inventory, OrderItem } = require('../models');
const logger = require('../utils/logger');
const { Op, sequelize } = require('sequelize');

class AdminController {
  // Get dashboard statistics
  static async getDashboardStats(req, res) {
    try {
      const stats = await Promise.all([
        // User statistics
        User.count(),
        User.count({ where: { user_type: 'customer' } }),
        User.count({ where: { user_type: 'hubowner' } }),
        User.count({ where: { user_type: 'courier' } }),
        User.count({ where: { is_active: true } }),

        // Hub statistics
        Hub.count(),
        Hub.count({ where: { is_active: true } }),

        // Product statistics
        Product.count(),
        Product.count({ where: { is_active: true } }),

        // Order statistics
        Order.count(),
        Order.count({ where: { status: 'pending' } }),
        Order.count({ where: { status: 'in_transit' } }),
        Order.count({ where: { status: 'delivered' } }),
        Order.sum('total_amount'),

        // Recent activity counts (last 30 days)
        User.count({
          where: {
            created_at: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        Order.count({
          where: {
            created_at: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      const dashboardData = {
        users: {
          total: stats[0],
          customers: stats[1],
          hub_owners: stats[2],
          couriers: stats[3],
          active: stats[4],
          new_this_month: stats[14]
        },
        hubs: {
          total: stats[5],
          active: stats[6]
        },
        products: {
          total: stats[7],
          active: stats[8]
        },
        orders: {
          total: stats[9],
          pending: stats[10],
          in_transit: stats[11],
          delivered: stats[12],
          total_revenue: stats[13] || 0,
          new_this_month: stats[15]
        }
      };

      res.json({
        success: true,
        message: 'Dashboard statistics retrieved successfully',
        data: {
          stats: dashboardData
        }
      });

    } catch (error) {
      logger.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get all users with pagination and filtering (Admin only)
  static async getAllUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        user_type,
        is_active,
        search,
        sort = 'created_at',
        order = 'desc'
      } = req.query;

      let whereClause = {};

      if (user_type) {
        whereClause.user_type = user_type;
      }

      if (is_active !== undefined) {
        whereClause.is_active = is_active === 'true';
      }

      if (search) {
        whereClause[Op.or] = [
          { full_name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const users = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password_hash', 'verification_token', 'reset_password_token'] },
        include: [
          {
            model: Hub,
            as: 'ownedHubs',
            attributes: ['id', 'name', 'is_active']
          }
        ],
        order: [[sort, order.toUpperCase()]],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      res.json({
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users: users.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: users.count,
            pages: Math.ceil(users.count / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve users',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update user status (activate/deactivate)
  static async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_active, is_verified } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const updateData = {};
      if (is_active !== undefined) updateData.is_active = is_active;
      if (is_verified !== undefined) updateData.is_verified = is_verified;

      await user.update(updateData);

      logger.info(`User status updated: ${user.email} by admin ${req.user.email}`);

      res.json({
        success: true,
        message: 'User status updated successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            is_active: user.is_active,
            is_verified: user.is_verified
          }
        }
      });

    } catch (error) {
      logger.error('Update user status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get system analytics
  static async getAnalytics(req, res) {
    try {
      const { period = '7d' } = req.query;

      let dateRange;
      switch (period) {
        case '24h':
          dateRange = new Date(Date.now() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          dateRange = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateRange = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          dateRange = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateRange = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }

      // Order analytics
      const orderAnalytics = await Order.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'order_count'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
          'status'
        ],
        where: {
          created_at: { [Op.gte]: dateRange }
        },
        group: [sequelize.fn('DATE', sequelize.col('created_at')), 'status'],
        order: [['date', 'ASC']],
        raw: true
      });

      // User registration analytics
      const userAnalytics = await User.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'user_count'],
          'user_type'
        ],
        where: {
          created_at: { [Op.gte]: dateRange }
        },
        group: [sequelize.fn('DATE', sequelize.col('created_at')), 'user_type'],
        order: [['date', 'ASC']],
        raw: true
      });

      // Hub performance analytics
      const hubAnalytics = await Hub.findAll({
        attributes: [
          'id',
          'name',
          [sequelize.fn('COUNT', sequelize.col('sourceOrders.id')), 'order_count'],
          [sequelize.fn('SUM', sequelize.col('sourceOrders.total_amount')), 'revenue']
        ],
        include: [
          {
            model: Order,
            as: 'sourceOrders',
            attributes: [],
            where: {
              created_at: { [Op.gte]: dateRange }
            },
            required: false
          }
        ],
        group: ['Hub.id', 'Hub.name'],
        order: [[sequelize.literal('order_count'), 'DESC']],
        limit: 10,
        raw: true
      });

      // Product performance analytics
      const productAnalytics = await Product.findAll({
        attributes: [
          'id',
          'name',
          'category',
          [sequelize.fn('COUNT', sequelize.col('orderItems.id')), 'order_count'],
          [sequelize.fn('SUM', sequelize.col('orderItems.quantity')), 'total_quantity']
        ],
        include: [
          {
            model: OrderItem,
            as: 'orderItems',
            attributes: [],
            include: [
              {
                model: Order,
                as: 'order',
                attributes: [],
                where: {
                  created_at: { [Op.gte]: dateRange }
                }
              }
            ],
            required: false
          }
        ],
        group: ['Product.id', 'Product.name', 'Product.category'],
        order: [[sequelize.literal('order_count'), 'DESC']],
        limit: 10,
        raw: true
      });

      res.json({
        success: true,
        message: 'Analytics retrieved successfully',
        data: {
          period,
          date_range: dateRange,
          order_analytics: orderAnalytics,
          user_analytics: userAnalytics,
          hub_performance: hubAnalytics,
          product_performance: productAnalytics
        }
      });

    } catch (error) {
      logger.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get system health and monitoring info
  static async getSystemHealth(req, res) {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      };

      // Database health check
      try {
        await sequelize.authenticate();
        health.database = 'connected';
      } catch (error) {
        health.database = 'error';
        health.status = 'unhealthy';
      }

      // Check for recent errors (this would be enhanced with proper logging)
      const recentErrors = []; // Placeholder for error monitoring

      health.recent_errors = recentErrors.length;
      health.services = {
        api: 'running',
        database: health.database,
        websocket: 'running' // Would check actual WebSocket status
      };

      res.json({
        success: true,
        message: 'System health retrieved successfully',
        data: health
      });

    } catch (error) {
      logger.error('Get system health error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve system health',
        data: {
          status: 'unhealthy',
          error: error.message
        }
      });
    }
  }

  // Backup and export data
  static async exportData(req, res) {
    try {
      const { type = 'all' } = req.query;

      const exportData = {};

      if (type === 'all' || type === 'users') {
        exportData.users = await User.findAll({
          attributes: { exclude: ['password_hash', 'verification_token', 'reset_password_token'] }
        });
      }

      if (type === 'all' || type === 'hubs') {
        exportData.hubs = await Hub.findAll();
      }

      if (type === 'all' || type === 'products') {
        exportData.products = await Product.findAll();
      }

      if (type === 'all' || type === 'orders') {
        exportData.orders = await Order.findAll({
          include: [
            { model: OrderItem, as: 'orderItems' }
          ]
        });
      }

      if (type === 'all' || type === 'inventory') {
        exportData.inventory = await Inventory.findAll();
      }

      const exportInfo = {
        exported_at: new Date().toISOString(),
        exported_by: req.user.email,
        type,
        record_counts: Object.keys(exportData).reduce((acc, key) => {
          acc[key] = exportData[key].length;
          return acc;
        }, {})
      };

      logger.info(`Data export performed by admin ${req.user.email}: ${type}`);

      res.json({
        success: true,
        message: 'Data exported successfully',
        data: {
          export_info: exportInfo,
          exported_data: exportData
        }
      });

    } catch (error) {
      logger.error('Export data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Clear old data and logs
  static async cleanupData(req, res) {
    try {
      const { days = 90 } = req.body;
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const deletedCounts = {};

      // Delete old cancelled/failed orders (but keep delivered orders for history)
      const deletedOrders = await Order.destroy({
        where: {
          status: { [Op.in]: ['cancelled', 'failed'] },
          created_at: { [Op.lt]: cutoffDate }
        }
      });
      deletedCounts.old_orders = deletedOrders;

      // Delete old inactive user tokens
      const updatedUsers = await User.update(
        {
          verification_token: null,
          reset_password_token: null,
          reset_password_expires: null
        },
        {
          where: {
            [Op.or]: [
              { reset_password_expires: { [Op.lt]: new Date() } },
              { created_at: { [Op.lt]: cutoffDate } }
            ]
          }
        }
      );
      deletedCounts.cleaned_tokens = updatedUsers[0];

      logger.info(`Data cleanup performed by admin ${req.user.email}: ${JSON.stringify(deletedCounts)}`);

      res.json({
        success: true,
        message: 'Data cleanup completed successfully',
        data: {
          cleanup_date: new Date().toISOString(),
          cutoff_date: cutoffDate,
          deleted_counts: deletedCounts
        }
      });

    } catch (error) {
      logger.error('Cleanup data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cleanup data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = AdminController;
