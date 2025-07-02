const { 
  Promotion, 
  UserPromotionUsage, 
  User, 
  Order 
} = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Get all active promotions
 */
const getActivePromotions = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const currentDate = new Date();

    const promotions = await Promotion.findAndCountAll({
      where: {
        is_active: true,
        start_date: { [Op.lte]: currentDate },
        end_date: { [Op.gte]: currentDate }
      },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        promotions: promotions.rows,
        total: promotions.count,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total_pages: Math.ceil(promotions.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get active promotions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch promotions' 
    });
  }
};

/**
 * Get promotion by ID
 */
const getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;

    const promotion = await Promotion.findByPk(id, {
      include: [{
        model: UserPromotionUsage,
        as: 'usages',
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }]
      }]
    });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    res.json({
      success: true,
      data: promotion
    });
  } catch (error) {
    console.error('Get promotion by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch promotion' 
    });
  }
};

/**
 * Create new promotion (Admin only)
 */
const createPromotion = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create promotions'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      code,
      title,
      description,
      promotion_type,
      discount_value,
      discount_percentage,
      minimum_order_amount,
      maximum_discount_amount,
      usage_limit_per_user,
      total_usage_limit,
      start_date,
      end_date,
      terms_and_conditions,
      target_user_criteria,
      applicable_products,
      applicable_categories
    } = req.body;

    const promotion = await Promotion.create({
      code,
      title,
      description,
      promotion_type,
      discount_value,
      discount_percentage,
      minimum_order_amount,
      maximum_discount_amount,
      usage_limit_per_user,
      total_usage_limit,
      start_date,
      end_date,
      terms_and_conditions,
      target_user_criteria: target_user_criteria || {},
      applicable_products: applicable_products || [],
      applicable_categories: applicable_categories || [],
      is_active: true,
      current_usage_count: 0
    });

    res.status(201).json({
      success: true,
      data: promotion,
      message: 'Promotion created successfully'
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Promotion code already exists'
      });
    }
    console.error('Create promotion error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create promotion' 
    });
  }
};

/**
 * Update promotion (Admin only)
 */
const updatePromotion = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update promotions'
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const [updatedRowsCount] = await Promotion.update(updateData, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    const updatedPromotion = await Promotion.findByPk(id);

    res.json({
      success: true,
      data: updatedPromotion,
      message: 'Promotion updated successfully'
    });
  } catch (error) {
    console.error('Update promotion error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update promotion' 
    });
  }
};

/**
 * Validate promotion code
 */
const validatePromotionCode = async (req, res) => {
  try {
    const { code } = req.params;
    const { user_id, order_amount } = req.query;
    const currentDate = new Date();

    const promotion = await Promotion.findOne({
      where: {
        code,
        is_active: true,
        start_date: { [Op.lte]: currentDate },
        end_date: { [Op.gte]: currentDate }
      }
    });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired promotion code'
      });
    }

    // Check minimum order amount
    if (promotion.minimum_order_amount && parseFloat(order_amount) < promotion.minimum_order_amount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${promotion.minimum_order_amount} required`
      });
    }

    // Check total usage limit
    if (promotion.total_usage_limit && promotion.current_usage_count >= promotion.total_usage_limit) {
      return res.status(400).json({
        success: false,
        message: 'Promotion usage limit exceeded'
      });
    }

    // Check user-specific usage limit
    if (user_id && promotion.usage_limit_per_user) {
      const userUsageCount = await UserPromotionUsage.count({
        where: {
          user_id,
          promotion_id: promotion.id
        }
      });

      if (userUsageCount >= promotion.usage_limit_per_user) {
        return res.status(400).json({
          success: false,
          message: 'You have reached the usage limit for this promotion'
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (promotion.promotion_type === 'fixed_amount') {
      discountAmount = promotion.discount_value;
    } else if (promotion.promotion_type === 'percentage') {
      discountAmount = (parseFloat(order_amount) * promotion.discount_percentage) / 100;
      if (promotion.maximum_discount_amount) {
        discountAmount = Math.min(discountAmount, promotion.maximum_discount_amount);
      }
    }

    res.json({
      success: true,
      data: {
        promotion,
        discount_amount: discountAmount,
        final_amount: parseFloat(order_amount) - discountAmount
      },
      message: 'Promotion code is valid'
    });
  } catch (error) {
    console.error('Validate promotion code error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to validate promotion code' 
    });
  }
};

/**
 * Apply promotion to order
 */
const applyPromotion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { promotion_id, user_id, order_id, discount_amount } = req.body;

    // Verify the promotion is still valid
    const promotion = await Promotion.findByPk(promotion_id);
    if (!promotion || !promotion.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive promotion'
      });
    }

    // Record promotion usage
    const promotionUsage = await UserPromotionUsage.create({
      user_id,
      promotion_id,
      order_id,
      discount_amount,
      used_at: new Date()
    });

    // Update promotion usage count
    await promotion.increment('current_usage_count');

    res.status(201).json({
      success: true,
      data: promotionUsage,
      message: 'Promotion applied successfully'
    });
  } catch (error) {
    console.error('Apply promotion error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to apply promotion' 
    });
  }
};

/**
 * Get user promotion history
 */
const getUserPromotionHistory = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    // Verify user has permission
    if (req.user.id !== parseInt(user_id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this promotion history'
      });
    }

    const promotionHistory = await UserPromotionUsage.findAndCountAll({
      where: { user_id },
      include: [
        {
          model: Promotion,
          as: 'promotion',
          attributes: ['id', 'code', 'title', 'promotion_type']
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'order_number', 'total_amount']
        }
      ],
      order: [['used_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        promotion_history: promotionHistory.rows,
        total: promotionHistory.count,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total_pages: Math.ceil(promotionHistory.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user promotion history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch promotion history' 
    });
  }
};

/**
 * Deactivate promotion (Admin only)
 */
const deactivatePromotion = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can deactivate promotions'
      });
    }

    const { id } = req.params;

    const [updatedRowsCount] = await Promotion.update(
      { is_active: false },
      { where: { id } }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    res.json({
      success: true,
      message: 'Promotion deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate promotion error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to deactivate promotion' 
    });
  }
};

module.exports = {
  getActivePromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  validatePromotionCode,
  applyPromotion,
  getUserPromotionHistory,
  deactivatePromotion
};
