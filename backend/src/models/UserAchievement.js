const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserAchievement = sequelize.define('UserAchievement', {
    achievement_id: {
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
    achievement_type: {
      type: DataTypes.ENUM('deliveries_completed', 'hubs_managed', 'earnings_milestone', 'community_service', 'quality_rating', 'time_record'),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    badge_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    badge_rarity: {
      type: DataTypes.ENUM('common', 'rare', 'epic', 'legendary'),
      defaultValue: 'common'
    },
    points_earned: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    progress_current: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    progress_target: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'user_achievements',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        name: 'idx_user_achievements_user_id',
        fields: ['user_id']
      },
      {
        name: 'idx_user_achievements_type',
        fields: ['achievement_type']
      },
      {
        name: 'idx_user_achievements_completed',
        fields: ['is_completed', 'completed_at']
      }
    ]
  });

  // Instance methods
  UserAchievement.prototype.updateProgress = function(progressValue) {
    this.progress_current = Math.min(progressValue, this.progress_target);
    if (this.progress_current >= this.progress_target && !this.is_completed) {
      this.is_completed = true;
      this.completed_at = new Date();
    }
  };

  UserAchievement.prototype.getProgressPercentage = function() {
    return Math.round((this.progress_current / this.progress_target) * 100);
  };

  UserAchievement.prototype.isNearCompletion = function(threshold = 0.9) {
    return (this.progress_current / this.progress_target) >= threshold;
  };

  return UserAchievement;
};
