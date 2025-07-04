const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SafetyReport extends Model {
    static associate(models) {
      SafetyReport.belongsTo(models.User, {
        foreignKey: 'reported_by',
        as: 'reporter'
      });
      SafetyReport.belongsTo(models.User, {
        foreignKey: 'reported_user_id',
        as: 'reportedUser'
      });
      SafetyReport.belongsTo(models.Hub, {
        foreignKey: 'hub_id',
        as: 'hub'
      });
      SafetyReport.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
      });
    }
  }

  SafetyReport.init({
    report_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reported_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reported_user_id: {
      type: DataTypes.UUID,
    },
    hub_id: {
      type: DataTypes.UUID,
    },
    order_id: {
      type: DataTypes.UUID,
    },
    incident_type: {
      type: DataTypes.ENUM('safety_violation', 'harassment', 'fraud', 'property_damage', 'theft', 'inappropriate_behavior', 'emergency', 'other'),
      allowNull: false,
    },
    severity_level: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    incident_location: {
      type: DataTypes.JSONB, // lat, lng, address
    },
    incident_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    evidence_files: {
      type: DataTypes.JSONB, // photo/video URLs
      defaultValue: [],
    },
    witness_information: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    status: {
      type: DataTypes.ENUM('submitted', 'under_review', 'investigating', 'resolved', 'dismissed', 'escalated'),
      defaultValue: 'submitted',
    },
    priority_level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 5
      }
    },
    assigned_to: {
      type: DataTypes.UUID, // admin investigating
    },
    investigation_notes: {
      type: DataTypes.TEXT,
    },
    resolution_details: {
      type: DataTypes.TEXT,
    },
    action_taken: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    follow_up_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reporter_anonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    resolved_at: {
      type: DataTypes.DATE,
    },
    resolution_satisfaction: {
      type: DataTypes.INTEGER, // 1-5 rating
      validate: {
        min: 1,
        max: 5
      }
    },
  }, {
    sequelize,
    modelName: 'SafetyReport',
    tableName: 'safety_reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return SafetyReport;
};
