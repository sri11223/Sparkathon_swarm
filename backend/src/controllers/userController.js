const { User, Hub, Order } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class UserController {
  // Get user profile
  static async getProfile(req, res) {
    try {
      const userId = req.params.id || req.user.id;
      
      // Check if user can access this profile
      if (req.user.id !== userId && req.user.user_type !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own profile.'
        });
      }

      const user = await User.findByPk(userId, {
        include: [
          {
            model: Hub,
            as: 'ownedHubs',
            attributes: ['id', 'name', 'address', 'is_active']
          }
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user: user.toJSON()
        }
      });

    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const userId = req.params.id || req.user.id;
      
      // Check if user can update this profile
      if (req.user.id !== userId && req.user.user_type !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own profile.'
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const {
        full_name,
        phone,
        address,
        latitude,
        longitude,
        profile_image_url,
        vehicle_type,
        license_number
      } = req.body;

      const updateData = {};
      if (full_name !== undefined) updateData.full_name = full_name;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (latitude !== undefined) updateData.latitude = latitude;
      if (longitude !== undefined) updateData.longitude = longitude;
      if (profile_image_url !== undefined) updateData.profile_image_url = profile_image_url;

      // Courier-specific fields
      if (user.user_type === 'courier') {
        if (vehicle_type !== undefined) updateData.vehicle_type = vehicle_type;
        if (license_number !== undefined) updateData.license_number = license_number;
      }

      await user.update(updateData);

      logger.info(`Profile updated for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: user.toJSON()
        }
      });

    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get user's orders
  static async getUserOrders(req, res) {
    try {
      const userId = req.params.id || req.user.id;
      const { page = 1, limit = 10, status, sort = 'desc' } = req.query;
      
      // Check if user can access these orders
      if (req.user.id !== userId && req.user.user_type !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own orders.'
        });
      }

      const whereClause = {
        [Op.or]: [
          { customer_id: userId },
          { courier_id: userId }
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
            model: Hub,
            as: 'destinationHub',
            attributes: ['id', 'name', 'address']
          }
        ],
        order: [['created_at', sort.toUpperCase()]],
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
      logger.error('Get user orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve orders',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update courier location (for courier users)
  static async updateLocation(req, res) {
    try {
      const { latitude, longitude } = req.body;
      const user = req.user;

      if (user.user_type !== 'courier') {
        return res.status(403).json({
          success: false,
          message: 'Only couriers can update location'
        });
      }

      await user.update({
        current_lat: latitude,
        current_lng: longitude
      });

      // Emit location update to real-time clients
      const socketManager = req.app.get('socketManager');
      if (socketManager) {
        socketManager.emitToRoom(`courier_${user.id}`, 'location_update', {
          courier_id: user.id,
          latitude,
          longitude,
          timestamp: new Date()
        });
      }

      res.json({
        success: true,
        message: 'Location updated successfully',
        data: {
          latitude,
          longitude
        }
      });

    } catch (error) {
      logger.error('Update location error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update location',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update courier availability
  static async updateAvailability(req, res) {
    try {
      const { is_available } = req.body;
      const user = req.user;

      if (user.user_type !== 'courier') {
        return res.status(403).json({
          success: false,
          message: 'Only couriers can update availability'
        });
      }

      await user.update({ is_available });

      logger.info(`Courier availability updated: ${user.email} - ${is_available ? 'available' : 'unavailable'}`);

      res.json({
        success: true,
        message: 'Availability updated successfully',
        data: {
          is_available
        }
      });

    } catch (error) {
      logger.error('Update availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update availability',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get nearby couriers (for hub owners and admins)
  static async getNearbyCouriers(req, res) {
    try {
      const { latitude, longitude, radius = 10 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      // Convert radius from km to degrees (approximate)
      const radiusInDegrees = radius / 111;

      const couriers = await User.findAll({
        where: {
          user_type: 'courier',
          is_available: true,
          is_active: true,
          current_lat: {
            [Op.between]: [
              parseFloat(latitude) - radiusInDegrees,
              parseFloat(latitude) + radiusInDegrees
            ]
          },
          current_lng: {
            [Op.between]: [
              parseFloat(longitude) - radiusInDegrees,
              parseFloat(longitude) + radiusInDegrees
            ]
          }
        },
        attributes: [
          'id', 'full_name', 'phone', 'vehicle_type', 'rating',
          'current_lat', 'current_lng', 'total_deliveries'
        ],
        order: [['rating', 'DESC']]
      });

      res.json({
        success: true,
        message: 'Nearby couriers retrieved successfully',
        data: {
          couriers,
          count: couriers.length
        }
      });

    } catch (error) {
      logger.error('Get nearby couriers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve nearby couriers',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Deactivate user account
  static async deactivateAccount(req, res) {
    try {
      const userId = req.params.id || req.user.id;
      
      // Check if user can deactivate this account
      if (req.user.id !== userId && req.user.user_type !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only deactivate your own account.'
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.update({ is_active: false });

      logger.info(`Account deactivated: ${user.email}`);

      res.json({
        success: true,
        message: 'Account deactivated successfully'
      });

    } catch (error) {
      logger.error('Deactivate account error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate account',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = UserController;
