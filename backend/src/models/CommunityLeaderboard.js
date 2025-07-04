const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CommunityLeaderboard extends Model {
    static associate(models) {
      CommunityLeaderboard.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      CommunityLeaderboard.belongsTo(models.Hub, {
        foreignKey: 'hub_id',
        as: 'hub'
      });
      CommunityLeaderboard.belongsTo(models.CommunityChallenge, {
        foreignKey: 'challenge_id',
        as: 'challenge'
      });
    }
  }

  CommunityLeaderboard.init({
    leaderboard_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    hub_id: {
      type: DataTypes.UUID,
    },
    challenge_id: {
      type: DataTypes.UUID,
    },
    leaderboard_type: {
      type: DataTypes.ENUM('overall', 'weekly', 'monthly', 'challenge_specific', 'hub_specific', 'role_specific'),
      allowNull: false,
    },
    metric_type: {
      type: DataTypes.ENUM('total_earnings', 'deliveries_completed', 'customer_rating', 'community_impact', 'efficiency_score', 'challenge_points'),
      allowNull: false,
    },
    user_role: {
      type: DataTypes.ENUM('hub_owner', 'courier', 'customer', 'community_leader', 'volunteer'),
      allowNull: false,
    },
    current_score: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    previous_score: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    current_rank: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    previous_rank: {
      type: DataTypes.INTEGER,
    },
    rank_change: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    period_start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    period_end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    achievements: {
      type: DataTypes.JSONB, // badges, milestones achieved
      defaultValue: [],
    },
    performance_metrics: {
      type: DataTypes.JSONB, // detailed performance data
      defaultValue: {},
    },
    community_contributions: {
      type: DataTypes.JSONB, // community impact metrics
      defaultValue: {},
    },
    streak_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    best_streak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    next_level_points: {
      type: DataTypes.INTEGER,
    },
    badges_earned: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_activity: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'CommunityLeaderboard',
    tableName: 'community_leaderboards',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return CommunityLeaderboard;
};
