const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CrisisEvent extends Model {
    static associate(models) {
      CrisisEvent.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });
      CrisisEvent.hasMany(models.EmergencyHub, {
        foreignKey: 'crisis_event_id',
        as: 'emergencyHubs'
      });
      CrisisEvent.hasMany(models.Order, {
        foreignKey: 'crisis_event_id',
        as: 'emergencyOrders'
      });
    }
  }

  CrisisEvent.init({
    crisis_event_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    event_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    event_type: {
      type: DataTypes.ENUM('natural_disaster', 'pandemic', 'supply_shortage', 'infrastructure_failure', 'emergency_response'),
      allowNull: false,
    },
    severity_level: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical', 'catastrophic'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('monitoring', 'active', 'response_initiated', 'recovery', 'resolved'),
      defaultValue: 'monitoring',
      allowNull: false,
    },
    affected_areas: {
      type: DataTypes.JSONB, // geographic areas affected
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    emergency_supplies_needed: {
      type: DataTypes.JSONB, // list of critical supplies
      defaultValue: [],
    },
    volunteer_requirements: {
      type: DataTypes.JSONB, // volunteer needs and roles
      defaultValue: {},
    },
    coordination_center: {
      type: DataTypes.JSONB, // primary coordination location
    },
    estimated_duration: {
      type: DataTypes.STRING, // estimated duration
    },
    priority_level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 10
      }
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    activated_at: {
      type: DataTypes.DATE,
    },
    resolved_at: {
      type: DataTypes.DATE,
    },
    public_information: {
      type: DataTypes.JSONB, // info safe to share publicly
      defaultValue: {},
    },
    response_metrics: {
      type: DataTypes.JSONB, // tracking response effectiveness
      defaultValue: {},
    },
  }, {
    sequelize,
    modelName: 'CrisisEvent',
    tableName: 'crisis_events',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return CrisisEvent;
};
