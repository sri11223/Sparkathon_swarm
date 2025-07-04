const { PushNotificationToken, User, Notification } = require('../models');
const logger = require('../utils/logger');

class MobileController {
  // Register device for push notifications
  static async registerPushToken(req, res) {
    try {
      const {
        device_token,
        device_type,
        device_id,
        app_version,
        device_model,
        os_version,
        notification_preferences,
        timezone
      } = req.body;

      const user_id = req.user.user_id;

      // Check if token already exists
      let existingToken = await PushNotificationToken.findOne({
        where: { device_token }
      });

      if (existingToken) {
        // Update existing token with new user
        await existingToken.update({
          user_id,
          device_type,
          device_id,
          app_version,
          device_model,
          os_version,
          notification_preferences: notification_preferences || existingToken.notification_preferences,
          timezone: timezone || existingToken.timezone,
          is_active: true,
          last_used: new Date(),
          failed_delivery_count: 0
        });

        return res.json({
          success: true,
          message: 'Push notification token updated successfully',
          data: existingToken
        });
      }

      // Create new token
      const pushToken = await PushNotificationToken.create({
        user_id,
        device_token,
        device_type,
        device_id,
        app_version,
        device_model,
        os_version,
        notification_preferences: notification_preferences || {},
        timezone: timezone || 'UTC',
        is_active: true,
        last_used: new Date()
      });

      logger.info(`Push notification token registered for user ${user_id}, device: ${device_type}`);

      res.status(201).json({
        success: true,
        message: 'Push notification token registered successfully',
        data: pushToken
      });
    } catch (error) {
      logger.error('Register push token error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register push notification token',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update user location
  static async updateLocation(req, res) {
    try {
      const { latitude, longitude, accuracy, altitude, speed, heading } = req.body;
      const user_id = req.user.user_id;

      // Update user's current location
      await User.update({
        current_latitude: latitude,
        current_longitude: longitude,
        location_updated_at: new Date(),
        location_accuracy: accuracy,
        location_metadata: {
          altitude,
          speed,
          heading,
          timestamp: new Date().toISOString()
        }
      }, {
        where: { user_id }
      });

      // Emit location update to real-time system if user is a courier
      const user = await User.findByPk(user_id);
      if (user && user.role === 'courier') {
        const socketManager = require('../services/socketManager');
        socketManager.io.to(`courier:${user_id}`).emit('location_updated', {
          latitude,
          longitude,
          accuracy,
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        message: 'Location updated successfully',
        data: {
          latitude,
          longitude,
          timestamp: new Date().toISOString()
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

  // Get nearby everything (hubs, products, couriers)
  static async getNearbyEverything(req, res) {
    try {
      const { latitude, longitude, radius = 10 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      const { Hub, Product, Inventory } = require('../models');

      // Get nearby hubs with inventory
      const nearbyHubs = await Hub.findAll({
        where: {
          latitude: {
            $between: [parseFloat(latitude) - 0.1, parseFloat(latitude) + 0.1]
          },
          longitude: {
            $between: [parseFloat(longitude) - 0.1, parseFloat(longitude) + 0.1]
          },
          status: 'active'
        },
        include: [{
          model: Inventory,
          as: 'inventory',
          where: { quantity: { $gt: 0 } },
          required: false,
          include: [{
            model: Product,
            as: 'product'
          }]
        }],
        limit: 20
      });

      // Calculate distances and filter by radius
      const hubsWithDistance = nearbyHubs.map(hub => {
        const distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          parseFloat(hub.latitude),
          parseFloat(hub.longitude)
        );

        return {
          ...hub.toJSON(),
          distance: Math.round(distance * 100) / 100 // Round to 2 decimal places
        };
      }).filter(hub => hub.distance <= parseFloat(radius))
        .sort((a, b) => a.distance - b.distance);

      // Get available couriers nearby (if user is customer)
      let nearbyCouriers = [];
      if (req.user.role === 'customer') {
        nearbyCouriers = await User.findAll({
          where: {
            role: 'courier',
            is_active: true,
            current_latitude: {
              $between: [parseFloat(latitude) - 0.1, parseFloat(latitude) + 0.1]
            },
            current_longitude: {
              $between: [parseFloat(longitude) - 0.1, parseFloat(longitude) + 0.1]
            }
          },
          attributes: ['user_id', 'first_name', 'current_latitude', 'current_longitude', 'location_updated_at'],
          limit: 10
        });

        nearbyCouriers = nearbyCouriers.map(courier => {
          const distance = calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            parseFloat(courier.current_latitude),
            parseFloat(courier.current_longitude)
          );

          return {
            ...courier.toJSON(),
            distance: Math.round(distance * 100) / 100
          };
        }).filter(courier => courier.distance <= parseFloat(radius))
          .sort((a, b) => a.distance - b.distance);
      }

      res.json({
        success: true,
        message: 'Nearby resources retrieved successfully',
        data: {
          location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
          radius: parseFloat(radius),
          nearby_hubs: hubsWithDistance,
          nearby_couriers: nearbyCouriers,
          summary: {
            total_hubs: hubsWithDistance.length,
            total_couriers: nearbyCouriers.length,
            closest_hub_distance: hubsWithDistance.length > 0 ? hubsWithDistance[0].distance : null
          }
        }
      });
    } catch (error) {
      logger.error('Get nearby everything error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve nearby resources',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Offline data sync
  static async offlineSync(req, res) {
    try {
      const user_id = req.user.user_id;
      const { last_sync_timestamp, offline_actions } = req.body;

      const lastSync = last_sync_timestamp ? new Date(last_sync_timestamp) : new Date(Date.now() - 24*60*60*1000); // Default to 24 hours ago

      // Process offline actions if any
      const processedActions = [];
      if (offline_actions && offline_actions.length > 0) {
        for (const action of offline_actions) {
          try {
            // Process different types of offline actions
            switch (action.type) {
              case 'location_update':
                await User.update({
                  current_latitude: action.data.latitude,
                  current_longitude: action.data.longitude,
                  location_updated_at: new Date(action.timestamp)
                }, { where: { user_id } });
                processedActions.push({ ...action, status: 'success' });
                break;

              case 'order_status_update':
                const { Order } = require('../models');
                await Order.update({
                  status: action.data.status,
                  updated_at: new Date(action.timestamp)
                }, { where: { order_id: action.data.order_id } });
                processedActions.push({ ...action, status: 'success' });
                break;

              default:
                processedActions.push({ ...action, status: 'unsupported' });
            }
          } catch (actionError) {
            logger.error(`Offline action processing error:`, actionError);
            processedActions.push({ ...action, status: 'failed', error: actionError.message });
          }
        }
      }

      // Get updated data since last sync
      const { Hub, Order, Product } = require('../models');

      // Get user's relevant data updates
      const updatedOrders = await Order.findAll({
        where: {
          $or: [
            { customer_id: user_id },
            { courier_id: user_id }
          ],
          updated_at: { $gte: lastSync }
        },
        limit: 50
      });

      // Get updated hubs (if user is hub owner)
      let updatedHubs = [];
      if (req.user.role === 'hub_owner') {
        updatedHubs = await Hub.findAll({
          where: {
            owner_id: user_id,
            updated_at: { $gte: lastSync }
          }
        });
      }

      // Get updated products
      const updatedProducts = await Product.findAll({
        where: {
          updated_at: { $gte: lastSync }
        },
        limit: 100
      });

      const syncData = {
        sync_timestamp: new Date().toISOString(),
        processed_offline_actions: processedActions,
        updated_data: {
          orders: updatedOrders,
          hubs: updatedHubs,
          products: updatedProducts.slice(0, 50) // Limit for mobile data usage
        },
        sync_summary: {
          orders_updated: updatedOrders.length,
          hubs_updated: updatedHubs.length,
          products_updated: updatedProducts.length,
          offline_actions_processed: processedActions.length
        }
      };

      res.json({
        success: true,
        message: 'Offline sync completed successfully',
        data: syncData
      });
    } catch (error) {
      logger.error('Offline sync error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete offline sync',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update notification preferences
  static async updateNotificationPreferences(req, res) {
    try {
      const user_id = req.user.user_id;
      const { preferences, quiet_hours } = req.body;

      await PushNotificationToken.update({
        notification_preferences: preferences,
        quiet_hours: quiet_hours || { enabled: false, start: '22:00', end: '08:00' }
      }, {
        where: { user_id, is_active: true }
      });

      res.json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: { preferences, quiet_hours }
      });
    } catch (error) {
      logger.error('Update notification preferences error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update notification preferences',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get user preferences
  static async getUserPreferences(req, res) {
    try {
      const user_id = req.user.user_id;

      const pushTokens = await PushNotificationToken.findAll({
        where: { user_id, is_active: true },
        attributes: ['notification_preferences', 'quiet_hours', 'device_type']
      });

      const user = await User.findByPk(user_id, {
        attributes: ['user_id', 'first_name', 'last_name', 'email', 'role', 'preferences']
      });

      res.json({
        success: true,
        message: 'User preferences retrieved successfully',
        data: {
          user_profile: user,
          notification_settings: pushTokens,
          app_preferences: user.preferences || {}
        }
      });
    } catch (error) {
      logger.error('Get user preferences error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user preferences',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = MobileController;
