const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Promotion = sequelize.define('Promotion', {
    promotion_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    promotion_type: {
      type: DataTypes.ENUM('discount', 'cashback', 'bogo', 'free_delivery', 'hub_bonus'),
      allowNull: false
    },
    discount_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    min_order_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    max_discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    applicable_user_types: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    applicable_hub_ids: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: true
    },
    applicable_product_categories: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    usage_limit_per_user: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    total_usage_limit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    current_usage_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    starts_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'promotions',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        name: 'idx_promotions_active_dates',
        fields: ['is_active', 'starts_at', 'expires_at']
      },
      {
        name: 'idx_promotions_type',
        fields: ['promotion_type']
      },
      {
        name: 'idx_promotions_active',
        fields: ['is_active']
      }
    ],
    validate: {
      hasDiscountValue() {
        if (!this.discount_percentage && !this.discount_amount) {
          throw new Error('Either discount_percentage or discount_amount must be specified');
        }
      },
      validDateRange() {
        if (this.starts_at >= this.expires_at) {
          throw new Error('Start date must be before expiry date');
        }
      }
    }
  });

  // Instance methods
  Promotion.prototype.isCurrentlyActive = function() {
    const now = new Date();
    return this.is_active && 
           this.starts_at <= now && 
           this.expires_at >= now &&
           (!this.total_usage_limit || this.current_usage_count < this.total_usage_limit);
  };

  Promotion.prototype.isApplicableToUser = function(userType) {
    return !this.applicable_user_types || 
           this.applicable_user_types.length === 0 || 
           this.applicable_user_types.includes(userType);
  };

  Promotion.prototype.isApplicableToHub = function(hubId) {
    return !this.applicable_hub_ids || 
           this.applicable_hub_ids.length === 0 || 
           this.applicable_hub_ids.includes(hubId);
  };

  Promotion.prototype.isApplicableToProduct = function(productCategory) {
    return !this.applicable_product_categories || 
           this.applicable_product_categories.length === 0 || 
           this.applicable_product_categories.includes(productCategory);
  };

  Promotion.prototype.calculateDiscount = function(orderAmount) {
    if (!this.isCurrentlyActive()) {
      return 0;
    }

    if (this.min_order_amount && orderAmount < this.min_order_amount) {
      return 0;
    }

    let discount = 0;

    if (this.discount_percentage) {
      discount = (orderAmount * this.discount_percentage) / 100;
    } else if (this.discount_amount) {
      discount = this.discount_amount;
    }

    if (this.max_discount_amount && discount > this.max_discount_amount) {
      discount = this.max_discount_amount;
    }

    return Math.round(discount * 100) / 100; // Round to 2 decimal places
  };

  Promotion.prototype.canUserUse = async function(userId) {
    if (!this.usage_limit_per_user) {
      return true;
    }

    const userUsageCount = await sequelize.models.UserPromotionUsage.count({
      where: {
        user_id: userId,
        promotion_id: this.promotion_id
      }
    });

    return userUsageCount < this.usage_limit_per_user;
  };

  Promotion.prototype.getUsageStats = async function() {
    const totalUsage = await sequelize.models.UserPromotionUsage.count({
      where: {
        promotion_id: this.promotion_id
      }
    });

    const uniqueUsers = await sequelize.models.UserPromotionUsage.count({
      where: {
        promotion_id: this.promotion_id
      },
      distinct: true,
      col: 'user_id'
    });

    return {
      total_usage: totalUsage,
      unique_users: uniqueUsers,
      usage_limit: this.total_usage_limit,
      remaining_uses: this.total_usage_limit ? this.total_usage_limit - totalUsage : null
    };
  };

  return Promotion;
};
