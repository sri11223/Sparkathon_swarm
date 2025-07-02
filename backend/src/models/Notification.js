const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }

  Notification.init({
    notification_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('order_status', 'new_delivery', 'payout_notification', 'promotional', 'system_alert', 'hub_inventory'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('sent', 'delivered', 'read', 'failed'),
      defaultValue: 'sent',
      allowNull: false,
    },
    related_entity_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    related_entity_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Notification;
};
