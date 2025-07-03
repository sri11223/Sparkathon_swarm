const { User, UserRating, CourierVehicle, Payout, Hub, Order, Delivery } = require('../models');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const multer = require('multer');
const path = require('path');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

/**
 * @description Create a new user
 * @route POST /api/users
 * @access Public
 */
const createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone_number, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists.' 
      });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create the new user
    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password_hash,
      phone_number,
      role,
    });

    logger.info(`New user created: ${newUser.email} (${newUser.role})`);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: newUser.toJSON()
      }
    });
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while creating user.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @description Get detailed user profile
 * @route GET /api/users/profile/detailed
 * @access Private
 */
const getDetailedProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Hub,
          as: 'hubs',
          attributes: ['hub_id', 'name', 'address', 'is_active']
        },
        {
          model: CourierVehicle,
          as: 'vehicles',
          attributes: ['vehicle_id', 'make', 'model', 'vehicle_type', 'status']
        },
        {
          model: UserRating,
          as: 'received_ratings',
          attributes: ['rating_id', 'score', 'comment', 'rating_type', 'created_at']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate average rating
    const ratings = user.received_ratings || [];
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length 
      : 0;

    // Get earnings summary if user is hub owner or courier
    let earningsSummary = null;
    if (user.role === 'hub_owner' || user.role === 'courier') {
      const payouts = await Payout.findAll({
        where: { user_id: userId },
        attributes: ['amount', 'status', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: 5
      });

      const totalEarnings = payouts
        .filter(payout => payout.status === 'completed')
        .reduce((sum, payout) => sum + parseFloat(payout.amount), 0);

      earningsSummary = {
        total_earnings: totalEarnings,
        recent_payouts: payouts
      };
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          ...user.toJSON(),
          average_rating: averageRating.toFixed(1),
          total_ratings: ratings.length,
          earnings: earningsSummary
        }
      }
    });

  } catch (error) {
    logger.error('Error getting detailed profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @description Update user profile
 * @route PUT /api/users/profile/update
 * @access Private
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password_hash;
    delete updateData.email; // Email changes should go through verification
    delete updateData.role; // Role changes should be admin-only
    delete updateData.is_email_verified;
    delete updateData.is_active;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update(updateData);

    logger.info(`User profile updated: ${user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @description Upload user avatar
 * @route POST /api/users/profile/avatar
 * @access Private
 */
const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.user_id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    await User.update(
      { avatar_url: avatarUrl },
      { where: { user_id: userId } }
    );

    logger.info(`Avatar uploaded for user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar_url: avatarUrl
      }
    });

  } catch (error) {
    logger.error('Error uploading avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @description Get user earnings summary
 * @route GET /api/users/earnings
 * @access Private
 */
const getEarnings = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const user = req.user;

    if (user.role !== 'hub_owner' && user.role !== 'courier') {
      return res.status(403).json({
        success: false,
        message: 'Only hub owners and couriers can view earnings'
      });
    }

    const payouts = await Payout.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });

    const completedPayouts = payouts.filter(p => p.status === 'completed');
    const pendingPayouts = payouts.filter(p => p.status === 'pending');

    const totalEarnings = completedPayouts.reduce((sum, payout) => sum + parseFloat(payout.amount), 0);
    const pendingEarnings = pendingPayouts.reduce((sum, payout) => sum + parseFloat(payout.amount), 0);

    // Get monthly earnings for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyEarnings = await Payout.findAll({
      where: {
        user_id: userId,
        status: 'completed',
        completion_date: {
          [require('sequelize').Op.gte]: sixMonthsAgo
        }
      },
      attributes: [
        [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('completion_date')), 'month'],
        [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'total']
      ],
      group: [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('completion_date'))],
      order: [[require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('completion_date')), 'ASC']]
    });

    res.json({
      success: true,
      message: 'Earnings retrieved successfully',
      data: {
        summary: {
          total_earnings: totalEarnings,
          pending_earnings: pendingEarnings,
          completed_payouts: completedPayouts.length,
          pending_payouts: pendingPayouts.length
        },
        monthly_earnings: monthlyEarnings,
        recent_payouts: payouts.slice(0, 10)
      }
    });

  } catch (error) {
    logger.error('Error getting earnings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve earnings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @description Request identity verification
 * @route POST /api/users/verification/request
 * @access Private
 */
const requestVerification = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { verification_type, documents } = req.body;

    // For now, we'll just update the background check status
    // In production, this would integrate with identity verification services
    await User.update(
      { background_check_status: 'pending' },
      { where: { user_id: userId } }
    );

    logger.info(`Verification requested for user: ${req.user.email} (Type: ${verification_type})`);

    res.json({
      success: true,
      message: 'Verification request submitted successfully',
      data: {
        status: 'pending',
        estimated_completion: '3-5 business days'
      }
    });

  } catch (error) {
    logger.error('Error requesting verification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit verification request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @description Check verification status
 * @route GET /api/users/verification/status
 * @access Private
 */
const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const user = await User.findByPk(userId, {
      attributes: ['user_id', 'background_check_status', 'is_email_verified', 'updated_at']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Verification status retrieved successfully',
      data: {
        email_verified: user.is_email_verified,
        background_check_status: user.background_check_status,
        last_updated: user.updated_at
      }
    });

  } catch (error) {
    logger.error('Error getting verification status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve verification status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createUser,
  getDetailedProfile,
  updateProfile,
  uploadAvatar: [upload.single('avatar'), uploadAvatar],
  getEarnings,
  requestVerification,
  getVerificationStatus
};