const { 
  UserAchievement, 
  Leaderboard, 
  User 
} = require('../models');
const { validationResult } = require('express-validator');

/**
 * Get user achievements
 */
const getUserAchievements = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // Verify user has permission to view achievements
    if (req.user.id !== parseInt(user_id) && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view these achievements' 
      });
    }

    const achievements = await UserAchievement.findAll({
      where: { user_id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }],
      order: [['achieved_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        achievements,
        total: achievements.length
      }
    });
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch achievements' 
    });
  }
};

/**
 * Award achievement to user
 */
const awardAchievement = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { user_id, achievement_type, points_awarded, metadata } = req.body;

    // Check if achievement already exists
    const existingAchievement = await UserAchievement.findOne({
      where: { 
        user_id, 
        achievement_type 
      }
    });

    if (existingAchievement) {
      return res.status(400).json({
        success: false,
        message: 'Achievement already awarded to this user'
      });
    }

    const achievement = await UserAchievement.create({
      user_id,
      achievement_type,
      points_awarded,
      metadata: metadata || {},
      achieved_at: new Date()
    });

    // Update user's total points if they exist in metadata
    const user = await User.findByPk(user_id);
    if (user && user.metadata && user.metadata.total_points !== undefined) {
      const currentPoints = user.metadata.total_points || 0;
      await user.update({
        metadata: {
          ...user.metadata,
          total_points: currentPoints + points_awarded
        }
      });
    }

    res.status(201).json({
      success: true,
      data: achievement,
      message: 'Achievement awarded successfully'
    });
  } catch (error) {
    console.error('Award achievement error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to award achievement' 
    });
  }
};

/**
 * Get leaderboard
 */
const getLeaderboard = async (req, res) => {
  try {
    const { category = 'overall', limit = 10 } = req.query;

    const leaderboard = await Leaderboard.findAll({
      where: { category },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'first_name', 'last_name']
      }],
      order: [['rank', 'ASC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        category,
        leaderboard,
        total: leaderboard.length
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch leaderboard' 
    });
  }
};

/**
 * Update leaderboard entry
 */
const updateLeaderboard = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { user_id, category, score, rank } = req.body;

    const [leaderboardEntry, created] = await Leaderboard.upsert({
      user_id,
      category,
      score,
      rank,
      last_updated: new Date()
    });

    res.json({
      success: true,
      data: leaderboardEntry,
      message: created ? 'Leaderboard entry created' : 'Leaderboard entry updated'
    });
  } catch (error) {
    console.error('Update leaderboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update leaderboard' 
    });
  }
};

/**
 * Get user rank
 */
const getUserRank = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { category = 'overall' } = req.query;

    const userEntry = await Leaderboard.findOne({
      where: { user_id, category },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'first_name', 'last_name']
      }]
    });

    if (!userEntry) {
      return res.status(404).json({
        success: false,
        message: 'User not found in leaderboard'
      });
    }

    res.json({
      success: true,
      data: userEntry
    });
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user rank' 
    });
  }
};

/**
 * Get achievement statistics
 */
const getAchievementStats = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Get achievement counts by type
    const achievementStats = await UserAchievement.findAll({
      where: { user_id },
      attributes: [
        'achievement_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('points_awarded')), 'total_points']
      ],
      group: ['achievement_type']
    });

    // Get total achievements and points
    const totalStats = await UserAchievement.findOne({
      where: { user_id },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_achievements'],
        [sequelize.fn('SUM', sequelize.col('points_awarded')), 'total_points']
      ]
    });

    res.json({
      success: true,
      data: {
        achievement_breakdown: achievementStats,
        total_achievements: totalStats?.dataValues.total_achievements || 0,
        total_points: totalStats?.dataValues.total_points || 0
      }
    });
  } catch (error) {
    console.error('Get achievement stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch achievement statistics' 
    });
  }
};

module.exports = {
  getUserAchievements,
  awardAchievement,
  getLeaderboard,
  updateLeaderboard,
  getUserRank,
  getAchievementStats
};
