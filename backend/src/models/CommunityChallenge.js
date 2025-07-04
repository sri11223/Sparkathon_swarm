const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CommunityChallenge extends Model {
    static associate(models) {
      CommunityChallenge.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });
      CommunityChallenge.hasMany(models.User, {
        foreignKey: 'active_challenge_id',
        as: 'participants'
      });
    }
  }

  CommunityChallenge.init({
    challenge_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    challenge_type: {
      type: DataTypes.ENUM('delivery_count', 'eco_friendly', 'community_service', 'efficiency', 'earnings', 'volunteer_hours'),
      allowNull: false,
    },
    difficulty_level: {
      type: DataTypes.ENUM('easy', 'medium', 'hard', 'expert'),
      defaultValue: 'medium',
    },
    target_metric: {
      type: DataTypes.STRING, // what needs to be achieved
      allowNull: false,
    },
    target_value: {
      type: DataTypes.INTEGER, // target number to reach
      allowNull: false,
    },
    reward_type: {
      type: DataTypes.ENUM('badge', 'points', 'voucher', 'cash', 'recognition'),
      allowNull: false,
    },
    reward_value: {
      type: DataTypes.JSONB, // reward details
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'completed', 'expired', 'cancelled'),
      defaultValue: 'draft',
    },
    participant_limit: {
      type: DataTypes.INTEGER,
      defaultValue: null, // null means unlimited
    },
    current_participants: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    completion_criteria: {
      type: DataTypes.JSONB, // detailed completion requirements
      allowNull: false,
    },
    leaderboard_data: {
      type: DataTypes.JSONB, // current standings
      defaultValue: {},
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    community_impact: {
      type: DataTypes.TEXT, // description of community benefit
    },
    success_metrics: {
      type: DataTypes.JSONB, // tracking success
      defaultValue: {},
    },
  }, {
    sequelize,
    modelName: 'CommunityChallenge',
    tableName: 'community_challenges',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return CommunityChallenge;
};
