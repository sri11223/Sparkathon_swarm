const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class PushNotificationToken extends Model {
    static associate(models) {
      PushNotificationToken.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }

  PushNotificationToken.init({
    token_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    device_token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    device_type: {
      type: DataTypes.ENUM('ios', 'android', 'web'),
      allowNull: false,
    },
    device_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    app_version: {
      type: DataTypes.STRING,
    },
    device_model: {
      type: DataTypes.STRING,
    },
    os_version: {
      type: DataTypes.STRING,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    notification_preferences: {
      type: DataTypes.JSONB,
      defaultValue: {
        order_updates: true,
        delivery_notifications: true,
        hub_updates: true,
        emergency_alerts: true,
        community_challenges: true,
        earnings_updates: true,
        promotional: false,
        marketing: false
      },
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'UTC',
    },
    quiet_hours: {
      type: DataTypes.JSONB, // start and end time for quiet hours
      defaultValue: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
    },
    last_used: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    failed_delivery_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    sequelize,
    modelName: 'PushNotificationToken',
    tableName: 'push_notification_tokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return PushNotificationToken;
};
