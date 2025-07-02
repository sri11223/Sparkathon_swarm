const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductReview = sequelize.define('ProductReview', {
    review_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'product_id'
      }
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
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
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    review_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_verified_purchase: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    helpful_votes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'product_reviews',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        name: 'idx_product_reviews_product_id',
        fields: ['product_id']
      },
      {
        name: 'idx_product_reviews_customer_id',
        fields: ['customer_id']
      },
      {
        name: 'idx_product_reviews_rating',
        fields: ['rating']
      },
      {
        name: 'idx_product_reviews_approved',
        fields: ['is_approved']
      },
      {
        name: 'idx_product_reviews_verified',
        fields: ['is_verified_purchase']
      }
    ]
  });

  // Instance methods
  ProductReview.prototype.addHelpfulVote = function() {
    this.helpful_votes = (this.helpful_votes || 0) + 1;
  };

  ProductReview.prototype.removeHelpfulVote = function() {
    this.helpful_votes = Math.max((this.helpful_votes || 0) - 1, 0);
  };

  ProductReview.prototype.isPositive = function() {
    return this.rating >= 4;
  };

  ProductReview.prototype.isNegative = function() {
    return this.rating <= 2;
  };

  ProductReview.prototype.isNeutral = function() {
    return this.rating === 3;
  };

  ProductReview.prototype.getReviewAge = function() {
    const now = new Date();
    const created = new Date(this.created_at);
    const diffInMs = now - created;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 1) return 'Today';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  ProductReview.prototype.getDisplayName = function() {
    // This would typically include the customer name from association
    return this.customer ? `${this.customer.first_name} ${this.customer.last_name.charAt(0)}.` : 'Anonymous';
  };

  ProductReview.prototype.getSummary = function(maxLength = 100) {
    if (!this.review_text) return this.title || '';
    
    const text = this.review_text.length > maxLength 
      ? this.review_text.substring(0, maxLength) + '...'
      : this.review_text;
    
    return text;
  };

  // Static methods
  ProductReview.getProductRatingStats = async function(productId) {
    const stats = await this.findAll({
      where: {
        product_id: productId,
        is_approved: true
      },
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('review_id')), 'count']
      ],
      group: ['rating'],
      raw: true
    });

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalReviews = 0;
    let totalRating = 0;

    stats.forEach(stat => {
      const rating = parseInt(stat.rating);
      const count = parseInt(stat.count);
      ratingCounts[rating] = count;
      totalReviews += count;
      totalRating += rating * count;
    });

    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    return {
      average_rating: Math.round(averageRating * 10) / 10,
      total_reviews: totalReviews,
      rating_distribution: ratingCounts,
      five_star_percentage: totalReviews > 0 ? Math.round((ratingCounts[5] / totalReviews) * 100) : 0,
      four_star_plus_percentage: totalReviews > 0 ? Math.round(((ratingCounts[4] + ratingCounts[5]) / totalReviews) * 100) : 0
    };
  };

  ProductReview.getRecentReviews = async function(productId, limit = 10) {
    return await this.findAll({
      where: {
        product_id: productId,
        is_approved: true
      },
      order: [['created_at', 'DESC']],
      limit,
      include: [{
        model: sequelize.models.User,
        as: 'customer',
        attributes: ['user_id', 'first_name', 'last_name']
      }]
    });
  };

  ProductReview.getTopReviews = async function(productId, limit = 5) {
    return await this.findAll({
      where: {
        product_id: productId,
        is_approved: true
      },
      order: [
        ['helpful_votes', 'DESC'],
        ['created_at', 'DESC']
      ],
      limit,
      include: [{
        model: sequelize.models.User,
        as: 'customer',
        attributes: ['user_id', 'first_name', 'last_name']
      }]
    });
  };

  ProductReview.getCustomerReviews = async function(customerId, limit = 20) {
    return await this.findAll({
      where: {
        customer_id: customerId
      },
      order: [['created_at', 'DESC']],
      limit,
      include: [{
        model: sequelize.models.Product,
        as: 'product',
        attributes: ['product_id', 'name', 'category']
      }]
    });
  };

  ProductReview.getAverageRatingForProducts = async function(productIds) {
    return await this.findAll({
      where: {
        product_id: {
          [sequelize.Sequelize.Op.in]: productIds
        },
        is_approved: true
      },
      attributes: [
        'product_id',
        [sequelize.fn('AVG', sequelize.col('rating')), 'average_rating'],
        [sequelize.fn('COUNT', sequelize.col('review_id')), 'review_count']
      ],
      group: ['product_id'],
      raw: true
    });
  };

  ProductReview.getPendingReviews = async function(limit = 50) {
    return await this.findAll({
      where: {
        is_approved: false
      },
      order: [['created_at', 'ASC']],
      limit,
      include: [
        {
          model: sequelize.models.Product,
          as: 'product',
          attributes: ['product_id', 'name', 'category']
        },
        {
          model: sequelize.models.User,
          as: 'customer',
          attributes: ['user_id', 'first_name', 'last_name', 'email']
        }
      ]
    });
  };

  ProductReview.canUserReviewProduct = async function(userId, productId) {
    // Check if user has purchased this product
    const orderItem = await sequelize.models.OrderItem.findOne({
      where: {
        product_id: productId
      },
      include: [{
        model: sequelize.models.Order,
        as: 'order',
        where: {
          customer_id: userId,
          status: 'completed'
        }
      }]
    });

    if (!orderItem) {
      return { canReview: false, reason: 'Must purchase product before reviewing' };
    }

    // Check if user has already reviewed this product
    const existingReview = await this.findOne({
      where: {
        customer_id: userId,
        product_id: productId
      }
    });

    if (existingReview) {
      return { canReview: false, reason: 'Already reviewed this product' };
    }

    return { canReview: true };
  };

  return ProductReview;
};
