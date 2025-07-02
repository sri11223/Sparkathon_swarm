const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class AiOptimizationLog extends Model {}

  AiOptimizationLog.init({
    log_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    optimization_type: DataTypes.ENUM('warehouse_picking', 'truck_loading', 'delivery_routing', 'hub_stocking'),
    inputs: DataTypes.JSONB,
    outputs: DataTypes.JSONB,
    performance_metrics: DataTypes.JSONB,
    duration_ms: DataTypes.INTEGER,
    algorithm_version: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'AiOptimizationLog',
    tableName: 'ai_optimization_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  return AiOptimizationLog;
};
