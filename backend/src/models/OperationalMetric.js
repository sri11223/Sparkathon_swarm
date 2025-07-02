const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class OperationalMetric extends Model {
    static associate(models) {
      OperationalMetric.belongsTo(models.Hub, { foreignKey: 'hub_id' });
      OperationalMetric.belongsTo(models.User, { foreignKey: 'courier_id' });
      OperationalMetric.belongsTo(models.Order, { foreignKey: 'order_id' });
    }
  }

  OperationalMetric.init({
    metric_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    hub_id: DataTypes.UUID,
    courier_id: DataTypes.UUID,
    order_id: DataTypes.UUID,
    metric_type: {
      type: DataTypes.ENUM(
        'order_acceptance_time', // Hub or Courier
        'order_fulfillment_time', // Hub: from confirmed to ready_for_pickup
        'delivery_pickup_time', // Courier: from accepted to picked_up
        'last_mile_delivery_time' // Courier: from picked_up to delivered
      ),
      allowNull: false,
    },
    value_seconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'OperationalMetric',
    tableName: 'operational_metrics',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  return OperationalMetric;
};
