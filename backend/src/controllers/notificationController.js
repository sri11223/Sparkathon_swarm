const { Notification, User, PushNotificationToken } = require('../models');
const logger = require('../utils/logger');
const socketManager = require('../services/socketManager');

class NotificationController {
  // Get all notifications for user
  static async getNotifications(req, res) {
    try {
      const { user_id } = req.user;
      const { page = 1, limit = 20, read = null, type = null } = req.query;

      const whereClause = { user_id };
      if (read !== null) whereClause.read = read === 'true';
      if (type) whereClause.type = type;

      const notifications = await Notification.findAndCountAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        include: [{
          model: User,
          as: 'User',
          attributes: ['user_id', 'username', 'profile_pic']
        }]
      });

      res.status(200).json({
        status: 'success',
        message: 'Notifications retrieved successfully',
        data: {
          notifications: notifications.rows,
          pagination: {
            total: notifications.count,
            page: parseInt(page),
            pages: Math.ceil(notifications.count / parseInt(limit)),
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      logger.error('Get notifications error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve notifications',
        error: error.message
      });
    }
  }

  // Send notification (Admin only)
  static async sendNotification(req, res) {
    try {
      const { user_id, user_ids, title, body, type, related_entity_id, data } = req.body;

      if (!title || !body || !type) {
        return res.status(400).json({
          status: 'error',
          message: 'Title, body, and type are required'
        });
      }

      // Determine target users
      let targetUserIds = [];
      if (user_id) {
        targetUserIds = [user_id];
      } else if (user_ids && Array.isArray(user_ids)) {
        targetUserIds = user_ids;
      } else {
        return res.status(400).json({
          status: 'error',
          message: 'Either user_id or user_ids array is required'
        });
      }

      const notifications = [];
      
      for (const userId of targetUserIds) {
        const notification = await Notification.create({
          notification_id: `ntf_${Date.now()}_${userId}`,
          user_id: userId,
          title,
          body,
          type,
          related_entity_id,
          data: data || {},
          read: false,
          sent_at: new Date()
        });

        notifications.push(notification);

        // Send real-time notification via WebSocket
        socketManager.sendNotificationToUser(userId, {
          notification_id: notification.notification_id,
          title,
          body,
          type,
          data: data || {}
        });
      }

      logger.info(`Sent ${notifications.length} notifications for type: ${type}`);

      res.status(201).json({
        status: 'success',
        message: `Notification sent to ${notifications.length} users`,
        data: { notifications }
      });

    } catch (error) {
      logger.error('Send notification error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to send notification',
        error: error.message
      });
    }
  }

  // Bulk notification sending (Admin only)
  static async sendBulkNotifications(req, res) {
    try {
      const { user_roles, hub_ids, title, body, type, data } = req.body;

      if (!title || !body || !type) {
        return res.status(400).json({
          status: 'error',
          message: 'Title, body, and type are required'
        });
      }

      let whereClause = {};
      
      // Filter by user roles
      if (user_roles && Array.isArray(user_roles)) {
        whereClause.role = { [require('sequelize').Op.in]: user_roles };
      }

      // Filter by hub association (for hub owners/couriers)
      if (hub_ids && Array.isArray(hub_ids)) {
        whereClause.hub_id = { [require('sequelize').Op.in]: hub_ids };
      }

      const users = await User.findAll({
        where: whereClause,
        attributes: ['user_id']
      });

      const notifications = [];
      
      for (const user of users) {
        const notification = await Notification.create({
          notification_id: `ntf_${Date.now()}_${user.user_id}`,
          user_id: user.user_id,
          title,
          body,
          type,
          data: data || {},
          read: false,
          sent_at: new Date()
        });

        notifications.push(notification);

        // Send real-time notification via WebSocket
        socketManager.sendNotificationToUser(user.user_id, {
          notification_id: notification.notification_id,
          title,
          body,
          type,
          data: data || {}
        });
      }

      logger.info(`Sent bulk notifications to ${notifications.length} users for type: ${type}`);

      res.status(201).json({
        status: 'success',
        message: `Bulk notification sent to ${notifications.length} users`,
        data: { 
          count: notifications.length,
          sample_notifications: notifications.slice(0, 5)
        }
      });

    } catch (error) {
      logger.error('Send bulk notifications error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to send bulk notifications',
        error: error.message
      });
    }
  }

  // Send emergency notification (Admin only)
  static async sendEmergencyNotification(req, res) {
    try {
      const { title, body, severity, affected_areas, immediate_action } = req.body;

      if (!title || !body || !severity) {
        return res.status(400).json({
          status: 'error',
          message: 'Title, body, and severity are required'
        });
      }

      // Get all active users
      const users = await User.findAll({
        where: { status: 'active' },
        attributes: ['user_id']
      });

      const emergencyData = {
        severity, // high, medium, low
        affected_areas: affected_areas || [],
        immediate_action: immediate_action || '',
        emergency_id: `emg_${Date.now()}`,
        timestamp: new Date().toISOString()
      };

      const notifications = [];
      
      for (const user of users) {
        const notification = await Notification.create({
          notification_id: `ntf_emg_${Date.now()}_${user.user_id}`,
          user_id: user.user_id,
          title,
          body,
          type: 'emergency_alert',
          data: emergencyData,
          read: false,
          sent_at: new Date()
        });

        notifications.push(notification);
      }

      // Broadcast emergency notification to all connected clients
      socketManager.broadcastSystemNotification({
        type: 'emergency_alert',
        title,
        body,
        severity,
        data: emergencyData
      });

      logger.warn(`Emergency notification sent to ${notifications.length} users: ${title}`);

      res.status(201).json({
        status: 'success',
        message: `Emergency notification sent to ${notifications.length} users`,
        data: { 
          emergency_id: emergencyData.emergency_id,
          count: notifications.length
        }
      });

    } catch (error) {
      logger.error('Send emergency notification error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to send emergency notification',
        error: error.message
      });
    }
  }

  // Get notification preferences
  static async getNotificationPreferences(req, res) {
    try {
      const { user_id } = req.user;

      const pushToken = await PushNotificationToken.findOne({
        where: { user_id },
        attributes: ['notification_preferences']
      });

      const preferences = pushToken?.notification_preferences || {
        order_notifications: true,
        delivery_notifications: true,
        promotional_notifications: true,
        system_notifications: true,
        emergency_notifications: true,
        community_notifications: true,
        earnings_notifications: true
      };

      res.status(200).json({
        status: 'success',
        message: 'Notification preferences retrieved successfully',
        data: { preferences }
      });

    } catch (error) {
      logger.error('Get notification preferences error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve notification preferences',
        error: error.message
      });
    }
  }

  // Update notification preferences
  static async updateNotificationPreferences(req, res) {
    try {
      const { user_id } = req.user;
      const { preferences } = req.body;

      if (!preferences || typeof preferences !== 'object') {
        return res.status(400).json({
          status: 'error',
          message: 'Valid preferences object is required'
        });
      }

      await PushNotificationToken.update({
        notification_preferences: preferences,
        updated_at: new Date()
      }, {
        where: { user_id }
      });

      logger.info(`Notification preferences updated for user ${user_id}`);

      res.status(200).json({
        status: 'success',
        message: 'Notification preferences updated successfully',
        data: { preferences }
      });

    } catch (error) {
      logger.error('Update notification preferences error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update notification preferences',
        error: error.message
      });
    }
  }

  // Get notification history
  static async getNotificationHistory(req, res) {
    try {
      const { user_id } = req.user;
      const { 
        page = 1, 
        limit = 50, 
        type = null, 
        start_date = null, 
        end_date = null 
      } = req.query;

      const whereClause = { user_id };
      if (type) whereClause.type = type;
      
      if (start_date && end_date) {
        whereClause.created_at = {
          [require('sequelize').Op.between]: [new Date(start_date), new Date(end_date)]
        };
      }

      const notifications = await Notification.findAndCountAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        attributes: ['notification_id', 'title', 'body', 'type', 'read', 'created_at', 'sent_at']
      });

      // Calculate statistics
      const stats = await Notification.findAll({
        where: { user_id },
        attributes: [
          'type',
          [require('sequelize').fn('COUNT', require('sequelize').col('notification_id')), 'count'],
          [require('sequelize').fn('SUM', 
            require('sequelize').literal('CASE WHEN read = true THEN 1 ELSE 0 END')
          ), 'read_count']
        ],
        group: ['type'],
        raw: true
      });

      res.status(200).json({
        status: 'success',
        message: 'Notification history retrieved successfully',
        data: {
          notifications: notifications.rows,
          statistics: stats,
          pagination: {
            total: notifications.count,
            page: parseInt(page),
            pages: Math.ceil(notifications.count / parseInt(limit)),
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      logger.error('Get notification history error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve notification history',
        error: error.message
      });
    }
  }

  // Mark notification as read
  static async markAsRead(req, res) {
    try {
      const { user_id } = req.user;
      const { id } = req.params;

      const notification = await Notification.findOne({
        where: { 
          notification_id: id,
          user_id 
        }
      });

      if (!notification) {
        return res.status(404).json({
          status: 'error',
          message: 'Notification not found'
        });
      }

      await notification.update({
        read: true,
        read_at: new Date()
      });

      logger.info(`Notification ${id} marked as read for user ${user_id}`);

      res.status(200).json({
        status: 'success',
        message: 'Notification marked as read successfully',
        data: { notification }
      });

    } catch (error) {
      logger.error('Mark notification as read error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to mark notification as read',
        error: error.message
      });
    }
  }

  // Delete notification
  static async deleteNotification(req, res) {
    try {
      const { user_id } = req.user;
      const { id } = req.params;

      const notification = await Notification.findOne({
        where: { 
          notification_id: id,
          user_id 
        }
      });

      if (!notification) {
        return res.status(404).json({
          status: 'error',
          message: 'Notification not found'
        });
      }

      await notification.destroy();

      logger.info(`Notification ${id} deleted for user ${user_id}`);

      res.status(200).json({
        status: 'success',
        message: 'Notification deleted successfully'
      });

    } catch (error) {
      logger.error('Delete notification error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete notification',
        error: error.message
      });
    }
  }
}

module.exports = NotificationController;
