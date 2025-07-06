const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CommunityHub extends Model {
    static associate(models) {
      CommunityHub.belongsTo(models.Hub, {
        foreignKey: 'hub_id',
        as: 'hub'
      });
      CommunityHub.belongsTo(models.User, {
        foreignKey: 'community_leader_id',
        as: 'communityLeader'
      });
      CommunityHub.hasMany(models.CommunityEarnings, {
        foreignKey: 'community_hub_id',
        as: 'earnings'
      });
    }
  }

  CommunityHub.init({
    community_hub_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    hub_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    community_leader_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    community_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    registration_status: {
      type: DataTypes.ENUM('pending', 'approved', 'active', 'suspended', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
    },
    community_type: {
      type: DataTypes.ENUM('residential', 'commercial', 'emergency', 'temporary'),
      defaultValue: 'residential',
      allowNull: false,
    },
    volunteer_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_orders_served: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    community_rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00,
    },
    special_services: {
      type: DataTypes.JSONB, // drive_thru, emergency_response, etc.
      defaultValue: {},
    },
    operating_hours: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    community_benefits: {
      type: DataTypes.JSONB, // special programs, discounts, etc.
      defaultValue: {},
    },
    verification_documents: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    approved_at: {
      type: DataTypes.DATE,
    },
    approved_by: {
      type: DataTypes.UUID,
    },
  }, {
    sequelize,
    modelName: 'CommunityHub',
    tableName: 'community_hubs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return CommunityHub;
};
