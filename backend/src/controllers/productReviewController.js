const { 
  ProductReview, 
  Product, 
  User, 
  Order, 
  OrderItem 
} = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Create product review
 */
const createProductReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      product_id,
      order_id,
      rating,
      review_text,
      photos
    } = req.body;

    const user_id = req.user.id;

    // Verify the user has purchased this product
    const orderItem = await OrderItem.findOne({
      include: [{
        model: Order,
        as: 'order',
        where: { 
          customer_id: user_id,
          status: 'delivered'
        }
      }],
      where: { 
        product_id,
        ...(order_id && { order_id })
      }
    });

    if (!orderItem) {
      return res.status(400).json({
        success: false,
        message: 'You can only review products you have purchased and received'
      });
    }

    // Check if user has already reviewed this product
    const existingReview = await ProductReview.findOne({
      where: {
        product_id,
        user_id
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    const productReview = await ProductReview.create({
      product_id,
      user_id,
      order_id: orderItem.order_id,
      rating,
      review_text,
      photos: photos || [],
      is_verified: true, // Since we verified the purchase
      created_at: new Date()
    });

    // Update product average rating
    await updateProductRating(product_id);

    const reviewWithDetails = await ProductReview.findByPk(productReview.id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'image_url']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'first_name', 'last_name']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: reviewWithDetails,
      message: 'Product review created successfully'
    });
  } catch (error) {
    console.error('Create product review error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create product review' 
    });
  }
};

/**
 * Get product reviews
 */
const getProductReviews = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { 
      rating, 
      limit = 10, 
      offset = 0, 
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    let whereClause = { product_id };
    if (rating) {
      whereClause.rating = parseInt(rating);
    }

    const reviews = await ProductReview.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'first_name', 'last_name']
        }
      ],
      order: [[sort_by, sort_order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get rating distribution
    const ratingDistribution = await ProductReview.findAll({
      where: { product_id },
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['rating'],
      order: [['rating', 'DESC']]
    });

    // Calculate average rating
    const avgRating = await ProductReview.findOne({
      where: { product_id },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'average_rating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_reviews']
      ]
    });

    res.json({
      success: true,
      data: {
        reviews: reviews.rows,
        total: reviews.count,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total_pages: Math.ceil(reviews.count / limit)
        },
        rating_stats: {
          average_rating: parseFloat(avgRating?.dataValues.average_rating || 0).toFixed(1),
          total_reviews: avgRating?.dataValues.total_reviews || 0,
          rating_distribution: ratingDistribution.map(item => ({
            rating: item.rating,
            count: parseInt(item.dataValues.count)
          }))
        }
      }
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch product reviews' 
    });
  }
};

/**
 * Get user reviews
 */
const getUserReviews = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    // Check authorization
    if (req.user.id !== parseInt(user_id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these reviews'
      });
    }

    const reviews = await ProductReview.findAndCountAll({
      where: { user_id },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'image_url', 'price']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        reviews: reviews.rows,
        total: reviews.count,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total_pages: Math.ceil(reviews.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user reviews' 
    });
  }
};

/**
 * Update product review
 */
const updateProductReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review_text, photos } = req.body;

    const review = await ProductReview.findByPk(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only the reviewer can update their review
    if (review.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (review_text !== undefined) updateData.review_text = review_text;
    if (photos !== undefined) updateData.photos = photos;
    updateData.updated_at = new Date();

    await review.update(updateData);

    // Update product average rating if rating changed
    if (rating !== undefined) {
      await updateProductRating(review.product_id);
    }

    const updatedReview = await ProductReview.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'image_url']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'first_name', 'last_name']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedReview,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Update product review error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update review' 
    });
  }
};

/**
 * Delete product review
 */
const deleteProductReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await ProductReview.findByPk(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only the reviewer or admin can delete the review
    if (review.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    const product_id = review.product_id;
    await review.destroy();

    // Update product average rating
    await updateProductRating(product_id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete product review error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete review' 
    });
  }
};

/**
 * Report inappropriate review
 */
const reportReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const review = await ProductReview.findByPk(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Add report to review metadata
    const reports = review.metadata?.reports || [];
    reports.push({
      reported_by: req.user.id,
      reason,
      reported_at: new Date()
    });

    await review.update({
      metadata: {
        ...review.metadata,
        reports,
        is_reported: true
      }
    });

    res.json({
      success: true,
      message: 'Review reported successfully'
    });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to report review' 
    });
  }
};

/**
 * Get review statistics
 */
const getReviewStatistics = async (req, res) => {
  try {
    const { product_id } = req.query;

    let whereClause = {};
    if (product_id) {
      whereClause.product_id = product_id;
    }

    // Get overall statistics
    const overallStats = await ProductReview.findOne({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_reviews'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'average_rating']
      ]
    });

    // Get rating distribution
    const ratingDistribution = await ProductReview.findAll({
      where: whereClause,
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['rating'],
      order: [['rating', 'DESC']]
    });

    // Get monthly review counts (last 12 months)
    const monthlyStats = await ProductReview.findAll({
      where: {
        ...whereClause,
        created_at: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 12))
        }
      },
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'ASC']]
    });

    res.json({
      success: true,
      data: {
        total_reviews: parseInt(overallStats?.dataValues.total_reviews || 0),
        average_rating: parseFloat(overallStats?.dataValues.average_rating || 0).toFixed(1),
        rating_distribution: ratingDistribution.map(item => ({
          rating: item.rating,
          count: parseInt(item.dataValues.count)
        })),
        monthly_reviews: monthlyStats.map(item => ({
          month: item.dataValues.month,
          count: parseInt(item.dataValues.count)
        }))
      }
    });
  } catch (error) {
    console.error('Get review statistics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch review statistics' 
    });
  }
};

/**
 * Helper function to update product average rating
 */
const updateProductRating = async (product_id) => {
  try {
    const stats = await ProductReview.findOne({
      where: { product_id },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'average_rating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'review_count']
      ]
    });

    if (stats) {
      await Product.update({
        rating: parseFloat(stats.dataValues.average_rating || 0),
        review_count: parseInt(stats.dataValues.review_count || 0)
      }, {
        where: { id: product_id }
      });
    }
  } catch (error) {
    console.error('Update product rating error:', error);
  }
};

module.exports = {
  createProductReview,
  getProductReviews,
  getUserReviews,
  updateProductReview,
  deleteProductReview,
  reportReview,
  getReviewStatistics
};
