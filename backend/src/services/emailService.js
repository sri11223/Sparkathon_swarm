const logger = require('../utils/logger');

// Mock email service - replace with real email service (SendGrid, AWS SES, etc.)
class EmailService {
  static async sendVerificationEmail(email, fullName, token) {
    try {
      // In production, replace this with actual email sending logic
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;
      
      logger.info(`📧 [MOCK] Verification email sent to: ${email}`);
      logger.info(`🔗 Verification URL: ${verificationUrl}`);
      
      // Mock email content
      const emailContent = {
        to: email,
        subject: 'Verify Your SwarmFill Account',
        html: `
          <h2>Welcome to SwarmFill, ${fullName}!</h2>
          <p>Please click the link below to verify your email address:</p>
          <a href="${verificationUrl}">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create this account, please ignore this email.</p>
        `
      };

      // In development, just log the email content
      if (process.env.NODE_ENV === 'development') {
        logger.info('📧 Email content:', emailContent);
      }

      return Promise.resolve(true);
      
    } catch (error) {
      logger.error('Email service error:', error);
      throw error;
    }
  }

  static async sendPasswordResetEmail(email, fullName, token) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
      
      logger.info(`📧 [MOCK] Password reset email sent to: ${email}`);
      logger.info(`🔗 Reset URL: ${resetUrl}`);
      
      const emailContent = {
        to: email,
        subject: 'Reset Your SwarmFill Password',
        html: `
          <h2>Password Reset Request</h2>
          <p>Hi ${fullName},</p>
          <p>You requested to reset your password. Click the link below to set a new password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 15 minutes.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
        `
      };

      if (process.env.NODE_ENV === 'development') {
        logger.info('📧 Email content:', emailContent);
      }

      return Promise.resolve(true);
      
    } catch (error) {
      logger.error('Email service error:', error);
      throw error;
    }
  }

  static async sendOrderNotification(email, fullName, orderDetails) {
    try {
      logger.info(`📧 [MOCK] Order notification sent to: ${email}`);
      
      const emailContent = {
        to: email,
        subject: `Order ${orderDetails.status}: #${orderDetails.id}`,
        html: `
          <h2>Order Update</h2>
          <p>Hi ${fullName},</p>
          <p>Your order #${orderDetails.id} has been ${orderDetails.status}.</p>
          <p>Total: $${orderDetails.total_amount}</p>
          <p>Track your order in the SwarmFill app.</p>
        `
      };

      if (process.env.NODE_ENV === 'development') {
        logger.info('📧 Email content:', emailContent);
      }

      return Promise.resolve(true);
      
    } catch (error) {
      logger.error('Email service error:', error);
      throw error;
    }
  }

  static async sendDeliveryAssignment(email, fullName, orderDetails) {
    try {
      logger.info(`📧 [MOCK] Delivery assignment sent to: ${email}`);
      
      const emailContent = {
        to: email,
        subject: `New Delivery Assignment: #${orderDetails.id}`,
        html: `
          <h2>New Delivery Assignment</h2>
          <p>Hi ${fullName},</p>
          <p>You have been assigned a new delivery:</p>
          <p>Order #${orderDetails.id}</p>
          <p>Pickup: ${orderDetails.pickup_address}</p>
          <p>Delivery: ${orderDetails.delivery_address}</p>
          <p>Value: $${orderDetails.total_amount}</p>
        `
      };

      if (process.env.NODE_ENV === 'development') {
        logger.info('📧 Email content:', emailContent);
      }

      return Promise.resolve(true);
      
    } catch (error) {
      logger.error('Email service error:', error);
      throw error;
    }
  }
}

module.exports = {
  sendVerificationEmail: EmailService.sendVerificationEmail,
  sendPasswordResetEmail: EmailService.sendPasswordResetEmail,
  sendOrderNotification: EmailService.sendOrderNotification,
  sendDeliveryAssignment: EmailService.sendDeliveryAssignment
};
