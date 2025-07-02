const { 
  NotificationPreference, 
  User 
} = require('../models');
const { validationResult } = require('express-validator');

/**
 * Get user notification preferences
 */
const getNotificationPreferences = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Check authorization
    if (req.user.id !== parseInt(user_id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these preferences'
      });
    }

    let preferences = await NotificationPreference.findOne({
      where: { user_id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'phone']
      }]
    });

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await NotificationPreference.create({
        user_id,
        email_notifications: true,
        sms_notifications: true,
        push_notifications: true,
        order_updates: true,
        delivery_updates: true,
        promotion_alerts: true,
        price_drop_alerts: false,
        inventory_alerts: false,
        newsletter_subscription: true,
        review_reminders: true,
        security_alerts: true,
        marketing_emails: false,
        notification_frequency: 'immediate'
      });

      // Fetch the created preferences with user details
      preferences = await NotificationPreference.findOne({
        where: { user_id },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'phone']
        }]
      });
    }

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch notification preferences' 
    });
  }
};

/**
 * Update notification preferences
 */
const updateNotificationPreferences = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Check authorization
    if (req.user.id !== parseInt(user_id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update these preferences'
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

    const updateData = req.body;
    updateData.updated_at = new Date();

    const [preferences, created] = await NotificationPreference.upsert({
      user_id,
      ...updateData
    });

    const updatedPreferences = await NotificationPreference.findOne({
      where: { user_id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'phone']
      }]
    });

    res.json({
      success: true,
      data: updatedPreferences,
      message: created ? 'Notification preferences created' : 'Notification preferences updated'
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update notification preferences' 
    });
  }
};

/**
 * Reset notification preferences to default
 */
const resetNotificationPreferences = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Check authorization
    if (req.user.id !== parseInt(user_id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reset these preferences'
      });
    }

    const defaultPreferences = {
      email_notifications: true,
      sms_notifications: true,
      push_notifications: true,
      order_updates: true,
      delivery_updates: true,
      promotion_alerts: true,
      price_drop_alerts: false,
      inventory_alerts: false,
      newsletter_subscription: true,
      review_reminders: true,
      security_alerts: true,
      marketing_emails: false,
      notification_frequency: 'immediate',
      quiet_hours_start: null,
      quiet_hours_end: null,
      timezone: 'Asia/Kolkata',
      updated_at: new Date()
    };

    await NotificationPreference.upsert({
      user_id,
      ...defaultPreferences
    });

    const resetPreferences = await NotificationPreference.findOne({
      where: { user_id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'phone']
      }]
    });

    res.json({
      success: true,
      data: resetPreferences,
      message: 'Notification preferences reset to default'
    });
  } catch (error) {
    console.error('Reset notification preferences error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset notification preferences' 
    });
  }
};

/**
 * Update specific notification preference
 */
const updateSpecificPreference = async (req, res) => {
  try {
    const { user_id, preference_type } = req.params;
    const { value } = req.body;

    // Check authorization
    if (req.user.id !== parseInt(user_id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update these preferences'
      });
    }

    // Valid preference types
    const validPreferences = [
      'email_notifications',
      'sms_notifications', 
      'push_notifications',
      'order_updates',
      'delivery_updates',
      'promotion_alerts',
      'price_drop_alerts',
      'inventory_alerts',
      'newsletter_subscription',
      'review_reminders',
      'security_alerts',
      'marketing_emails'
    ];

    if (!validPreferences.includes(preference_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid preference type'
      });
    }

    // Get or create preferences
    let preferences = await NotificationPreference.findOne({
      where: { user_id }
    });

    if (!preferences) {
      // Create default preferences first
      preferences = await NotificationPreference.create({
        user_id,
        email_notifications: true,
        sms_notifications: true,
        push_notifications: true,
        order_updates: true,
        delivery_updates: true,
        promotion_alerts: true,
        price_drop_alerts: false,
        inventory_alerts: false,
        newsletter_subscription: true,
        review_reminders: true,
        security_alerts: true,
        marketing_emails: false,
        notification_frequency: 'immediate'
      });
    }

    // Update specific preference
    await preferences.update({
      [preference_type]: value,
      updated_at: new Date()
    });

    const updatedPreferences = await NotificationPreference.findOne({
      where: { user_id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'phone']
      }]
    });

    res.json({
      success: true,
      data: updatedPreferences,
      message: `${preference_type} preference updated successfully`
    });
  } catch (error) {
    console.error('Update specific preference error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update preference' 
    });
  }
};

/**
 * Set quiet hours
 */
const setQuietHours = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { start_time, end_time, timezone } = req.body;

    // Check authorization
    if (req.user.id !== parseInt(user_id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update these preferences'
      });
    }

    const [preferences] = await NotificationPreference.upsert({
      user_id,
      quiet_hours_start: start_time,
      quiet_hours_end: end_time,
      timezone: timezone || 'Asia/Kolkata',
      updated_at: new Date()
    });

    const updatedPreferences = await NotificationPreference.findOne({
      where: { user_id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'phone']
      }]
    });

    res.json({
      success: true,
      data: updatedPreferences,
      message: 'Quiet hours updated successfully'
    });
  } catch (error) {
    console.error('Set quiet hours error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to set quiet hours' 
    });
  }
};

/**
 * Get notification preferences summary for all users (Admin only)
 */
const getPreferencesSummary = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Get counts for each preference type
    const preferenceCounts = await NotificationPreference.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_users'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN email_notifications THEN 1 ELSE 0 END')), 'email_enabled'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN sms_notifications THEN 1 ELSE 0 END')), 'sms_enabled'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN push_notifications THEN 1 ELSE 0 END')), 'push_enabled'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN promotion_alerts THEN 1 ELSE 0 END')), 'promotion_alerts_enabled'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN marketing_emails THEN 1 ELSE 0 END')), 'marketing_emails_enabled'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN newsletter_subscription THEN 1 ELSE 0 END')), 'newsletter_enabled']
      ]
    });

    // Get notification frequency distribution
    const frequencyDistribution = await NotificationPreference.findAll({
      attributes: [
        'notification_frequency',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['notification_frequency']
    });

    res.json({
      success: true,
      data: {
        summary: preferenceCounts[0] || {},
        frequency_distribution: frequencyDistribution.map(item => ({
          frequency: item.notification_frequency,
          count: parseInt(item.dataValues.count)
        }))
      }
    });
  } catch (error) {
    console.error('Get preferences summary error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch preferences summary' 
    });
  }
};

/**
 * Bulk update notification preferences (Admin only)
 */
const bulkUpdatePreferences = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { user_ids, preferences } = req.body;

    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'user_ids must be a non-empty array'
      });
    }

    const updateData = {
      ...preferences,
      updated_at: new Date()
    };

    const [updatedRowsCount] = await NotificationPreference.update(updateData, {
      where: {
        user_id: { [Op.in]: user_ids }
      }
    });

    res.json({
      success: true,
      data: {
        updated_users: updatedRowsCount
      },
      message: `Notification preferences updated for ${updatedRowsCount} users`
    });
  } catch (error) {
    console.error('Bulk update preferences error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to bulk update preferences' 
    });
  }
};

module.exports = {
  getNotificationPreferences,
  updateNotificationPreferences,
  resetNotificationPreferences,
  updateSpecificPreference,
  setQuietHours,
  getPreferencesSummary,
  bulkUpdatePreferences
};
