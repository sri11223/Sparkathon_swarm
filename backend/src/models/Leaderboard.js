const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Leaderboard = sequelize.define('Leaderboard', {
    leaderboard_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['deliveries', 'earnings', 'hub_performance', 'customer_rating', 'community_service']]
      }
    },
    score: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    rank_position: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    period_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['daily', 'weekly', 'monthly', 'all_time']]
      }
    },
    period_start: {
      type: DataTypes.DATE,
      allowNull: false
    },
    period_end: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'leaderboard',
    underscored: true,
    timestamps: false, // Only updated_at
    updatedAt: 'updated_at',
    createdAt: false,
    indexes: [
      {
        name: 'idx_leaderboard_category_period',
        fields: ['category', 'period_type']
      },
      {
        name: 'idx_leaderboard_user_id',
        fields: ['user_id']
      },
      {
        name: 'idx_leaderboard_ranking',
        fields: ['category', 'period_type', 'rank_position']
      },
      {
        name: 'idx_leaderboard_score',
        fields: ['category', 'period_type', 'score']
      }
    ]
  });

  // Static methods for leaderboard management
  Leaderboard.getTopPerformers = async function(category, periodType, limit = 10) {
    return await this.findAll({
      where: {
        category,
        period_type: periodType
      },
      order: [['rank_position', 'ASC']],
      limit,
      include: [{
        model: sequelize.models.User,
        as: 'user',
        attributes: ['user_id', 'first_name', 'last_name', 'profile_image_url']
      }]
    });
  };

  Leaderboard.getUserRank = async function(userId, category, periodType) {
    const entry = await this.findOne({
      where: {
        user_id: userId,
        category,
        period_type: periodType
      }
    });
    return entry ? entry.rank_position : null;
  };

  // Instance methods
  Leaderboard.prototype.isTopTier = function() {
    return this.rank_position <= 10;
  };

  Leaderboard.prototype.getPerformanceTier = function() {
    if (this.rank_position <= 3) return 'gold';
    if (this.rank_position <= 10) return 'silver';
    if (this.rank_position <= 50) return 'bronze';
    return 'participant';
  };

  Leaderboard.prototype.getImprovementNeeded = function(targetRank) {
    // This would typically query for the score at targetRank
    return targetRank < this.rank_position ? this.rank_position - targetRank : 0;
  };

  return Leaderboard;
};
