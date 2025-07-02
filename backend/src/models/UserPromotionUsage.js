const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserPromotionUsage = sequelize.define('UserPromotionUsage', {
    usage_id: {
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
    promotion_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'promotions',
        key: 'promotion_id'
      }
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'orders',
        key: 'order_id'
      }
    },
    discount_applied: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    used_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_promotion_usage',
    underscored: true,
    timestamps: false,
    indexes: [
      {
        name: 'idx_user_promotion_usage_user_id',
        fields: ['user_id']
      },
      {
        name: 'idx_user_promotion_usage_promotion_id',
        fields: ['promotion_id']
      },
      {
        name: 'idx_user_promotion_usage_order_id',
        fields: ['order_id']
      },
      {
        name: 'idx_user_promotion_usage_used_at',
        fields: ['used_at']
      }
    ]
  });

  // Static methods
  UserPromotionUsage.getUserPromotionStats = async function(userId, timeframe = 'all') {
    let whereClause = { user_id: userId };
    
    if (timeframe !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (timeframe) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
      }
      
      if (startDate) {
        whereClause.used_at = {
          [sequelize.Sequelize.Op.gte]: startDate
        };
      }
    }

    const stats = await this.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('usage_id')), 'total_uses'],
        [sequelize.fn('SUM', sequelize.col('discount_applied')), 'total_savings'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('promotion_id'))), 'unique_promotions']
      ],
      raw: true
    });

    return stats[0] || {
      total_uses: 0,
      total_savings: 0,
      unique_promotions: 0
    };
  };

  UserPromotionUsage.getPromotionUsageStats = async function(promotionId) {
    const stats = await this.findAll({
      where: { promotion_id: promotionId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('usage_id')), 'total_uses'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('user_id'))), 'unique_users'],
        [sequelize.fn('SUM', sequelize.col('discount_applied')), 'total_discount_given'],
        [sequelize.fn('AVG', sequelize.col('discount_applied')), 'avg_discount_per_use']
      ],
      raw: true
    });

    return stats[0] || {
      total_uses: 0,
      unique_users: 0,
      total_discount_given: 0,
      avg_discount_per_use: 0
    };
  };

  // Instance methods
  UserPromotionUsage.prototype.getSavingsPercentage = function(originalAmount) {
    if (!originalAmount || originalAmount <= 0) return 0;
    return Math.round((this.discount_applied / originalAmount) * 100 * 100) / 100;
  };

  UserPromotionUsage.prototype.isRecentUsage = function(hoursThreshold = 24) {
    const thresholdDate = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);
    return this.used_at >= thresholdDate;
  };

  return UserPromotionUsage;
};
