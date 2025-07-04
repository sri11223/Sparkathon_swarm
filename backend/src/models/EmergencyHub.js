const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class EmergencyHub extends Model {
    static associate(models) {
      EmergencyHub.belongsTo(models.Hub, {
        foreignKey: 'hub_id',
        as: 'hub'
      });
      EmergencyHub.belongsTo(models.CrisisEvent, {
        foreignKey: 'crisis_event_id',
        as: 'crisisEvent'
      });
      EmergencyHub.belongsTo(models.User, {
        foreignKey: 'volunteer_coordinator_id',
        as: 'coordinator'
      });
    }
  }

  EmergencyHub.init({
    emergency_hub_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    hub_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    crisis_event_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    volunteer_coordinator_id: {
      type: DataTypes.UUID,
    },
    emergency_status: {
      type: DataTypes.ENUM('preparing', 'active', 'fully_operational', 'scaling_down', 'deactivated'),
      defaultValue: 'preparing',
      allowNull: false,
    },
    capacity_emergency: {
      type: DataTypes.DECIMAL(10, 2), // emergency storage capacity
      defaultValue: 0,
    },
    volunteer_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    supplies_available: {
      type: DataTypes.JSONB, // emergency supplies inventory
      defaultValue: {},
    },
    services_offered: {
      type: DataTypes.JSONB, // emergency services
      defaultValue: [],
    },
    coordination_details: {
      type: DataTypes.JSONB, // coordination information
      defaultValue: {},
    },
    emergency_contacts: {
      type: DataTypes.JSONB, // emergency contact information
      defaultValue: {},
    },
    operating_schedule: {
      type: DataTypes.JSONB, // emergency operating hours
      defaultValue: {},
    },
    resource_requests: {
      type: DataTypes.JSONB, // requested resources
      defaultValue: [],
    },
    people_served: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    activation_priority: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 10
      }
    },
    activation_date: {
      type: DataTypes.DATE,
    },
    deactivation_date: {
      type: DataTypes.DATE,
    },
    performance_metrics: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  }, {
    sequelize,
    modelName: 'EmergencyHub',
    tableName: 'emergency_hubs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return EmergencyHub;
};
