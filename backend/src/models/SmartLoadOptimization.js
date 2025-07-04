const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SmartLoadOptimization extends Model {
    static associate(models) {
      SmartLoadOptimization.belongsTo(models.User, {
        foreignKey: 'requested_by',
        as: 'requester'
      });
      SmartLoadOptimization.belongsTo(models.Hub, {
        foreignKey: 'hub_id',
        as: 'hub'
      });
      SmartLoadOptimization.belongsTo(models.CourierVehicle, {
        foreignKey: 'vehicle_id',
        as: 'vehicle'
      });
    }
  }

  SmartLoadOptimization.init({
    optimization_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    optimization_type: {
      type: DataTypes.ENUM('warehouse_layout', 'truck_loading', 'route_optimization', 'inventory_placement', 'picking_route'),
      allowNull: false,
    },
    hub_id: {
      type: DataTypes.UUID,
    },
    vehicle_id: {
      type: DataTypes.UUID,
    },
    requested_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
      defaultValue: 'pending',
    },
    input_parameters: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    optimization_results: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    efficiency_improvement: {
      type: DataTypes.DECIMAL(5, 2), // percentage improvement
      defaultValue: 0,
    },
    space_utilization: {
      type: DataTypes.DECIMAL(5, 2), // percentage of space used
    },
    weight_distribution: {
      type: DataTypes.JSONB, // weight distribution data
      defaultValue: {},
    },
    loading_sequence: {
      type: DataTypes.JSONB, // optimal loading order
      defaultValue: [],
    },
    picking_route: {
      type: DataTypes.JSONB, // warehouse picking path
      defaultValue: [],
    },
    estimated_time_saved: {
      type: DataTypes.INTEGER, // minutes saved
      defaultValue: 0,
    },
    cost_savings: {
      type: DataTypes.DECIMAL(10, 2), // money saved
      defaultValue: 0,
    },
    ai_confidence_score: {
      type: DataTypes.DECIMAL(3, 2), // 0-1 confidence
    },
    processing_duration: {
      type: DataTypes.INTEGER, // milliseconds
    },
    implementation_status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'rejected'),
      defaultValue: 'pending',
    },
    feedback_rating: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 5
      }
    },
    performance_metrics: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  }, {
    sequelize,
    modelName: 'SmartLoadOptimization',
    tableName: 'smartload_optimizations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return SmartLoadOptimization;
};
