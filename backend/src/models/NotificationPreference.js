const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NotificationPreference = sequelize.define('NotificationPreference', {
    preference_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    subscription_type: {
      type: DataTypes.ENUM('email', 'sms', 'push', 'in_app'),
      allowNull: false
    },
    order_updates: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    delivery_notifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    promotional_offers: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    hub_inventory_alerts: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    earnings_reports: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    community_updates: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    emergency_alerts: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    frequency: {
      type: DataTypes.STRING(20),
      defaultValue: 'immediate',
      validate: {
        isIn: [['immediate', 'daily', 'weekly']]
      }
    }
  }, {
    tableName: 'notification_preferences',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        name: 'idx_notification_preferences_user_id',
        fields: ['user_id']
      },
      {
        name: 'idx_notification_preferences_user_type',
        fields: ['user_id', 'subscription_type']
      }
    ]
  });

  // Instance methods
  NotificationPreference.prototype.shouldReceiveNotification = function(notificationType) {
    switch (notificationType) {
      case 'order_update':
      case 'order_status':
        return this.order_updates;
      case 'delivery':
      case 'delivery_status':
        return this.delivery_notifications;
      case 'promotion':
      case 'discount':
      case 'offer':
        return this.promotional_offers;
      case 'inventory':
      case 'low_stock':
        return this.hub_inventory_alerts;
      case 'earnings':
      case 'payout':
        return this.earnings_reports;
      case 'community':
      case 'leaderboard':
        return this.community_updates;
      case 'emergency':
      case 'crisis':
        return this.emergency_alerts;
      default:
        return false;
    }
  };

  NotificationPreference.prototype.updatePreferences = function(preferences) {
    const allowedFields = [
      'order_updates', 'delivery_notifications', 'promotional_offers',
      'hub_inventory_alerts', 'earnings_reports', 'community_updates',
      'emergency_alerts', 'frequency'
    ];

    for (const [key, value] of Object.entries(preferences)) {
      if (allowedFields.includes(key)) {
        this[key] = value;
      }
    }
  };

  NotificationPreference.prototype.enableAll = function() {
    this.order_updates = true;
    this.delivery_notifications = true;
    this.promotional_offers = true;
    this.hub_inventory_alerts = true;
    this.earnings_reports = true;
    this.community_updates = true;
    this.emergency_alerts = true;
  };

  NotificationPreference.prototype.disableAll = function() {
    this.order_updates = false;
    this.delivery_notifications = false;
    this.promotional_offers = false;
    this.hub_inventory_alerts = false;
    this.earnings_reports = false;
    this.community_updates = false;
    // Note: emergency_alerts typically shouldn't be disabled for safety
  };

  NotificationPreference.prototype.getActiveChannels = function() {
    const channels = [];
    const types = ['order_updates', 'delivery_notifications', 'promotional_offers', 
                  'hub_inventory_alerts', 'earnings_reports', 'community_updates', 'emergency_alerts'];
    
    for (const type of types) {
      if (this[type]) {
        channels.push(type);
      }
    }
    
    return channels;
  };

  // Static methods
  NotificationPreference.createDefaultPreferences = async function(userId) {
    const defaultPreferences = [];
    const subscriptionTypes = ['email', 'sms', 'push', 'in_app'];

    for (const type of subscriptionTypes) {
      defaultPreferences.push({
        user_id: userId,
        subscription_type: type,
        // Default values are set in the model definition
      });
    }

    return await this.bulkCreate(defaultPreferences);
  };

  NotificationPreference.getUserPreferences = async function(userId) {
    return await this.findAll({
      where: { user_id: userId },
      order: [['subscription_type', 'ASC']]
    });
  };

  NotificationPreference.getUsersForNotification = async function(notificationType, subscriptionType = 'all') {
    let whereClause = {};
    
    // Map notification type to preference field
    const preferenceField = {
      'order_update': 'order_updates',
      'delivery': 'delivery_notifications',
      'promotion': 'promotional_offers',
      'inventory': 'hub_inventory_alerts',
      'earnings': 'earnings_reports',
      'community': 'community_updates',
      'emergency': 'emergency_alerts'
    }[notificationType];

    if (preferenceField) {
      whereClause[preferenceField] = true;
    }

    if (subscriptionType !== 'all') {
      whereClause.subscription_type = subscriptionType;
    }

    return await this.findAll({
      where: whereClause,
      include: [{
        model: sequelize.models.User,
        as: 'user',
        attributes: ['user_id', 'email', 'phone_number', 'first_name', 'last_name']
      }]
    });
  };

  return NotificationPreference;
};
