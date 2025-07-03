const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Real email service using nodemailer
class EmailService {
  static transporter = null;

  static async initializeTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransporter({
        service: 'gmail', // Use Gmail service
        auth: {
          user: 'your-email@gmail.com', // Replace with your Gmail
          pass: 'your-app-password',    // Replace with your Gmail App Password
        },
      });

      // Verify connection configuration
      try {
        await this.transporter.verify();
        logger.info('📧 Email service initialized successfully');
      } catch (error) {
        logger.error('📧 Email service initialization failed:', error);
        throw error;
      }
    }
    return this.transporter;
  }
  static async sendVerificationEmail(email, fullName, token) {
    try {
      const transporter = await this.initializeTransporter();
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;
      
      const mailOptions = {
        from: 'SwarmFill Network <your-email@gmail.com>', // Replace with your Gmail
        to: email,
        subject: 'Verify Your SwarmFill Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to SwarmFill, ${fullName}!</h2>
            <p>Thank you for registering with SwarmFill Network. Please click the button below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create this account, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">This email was sent by SwarmFill Network</p>
          </div>
        `
      };

      // Send the actual email
      const result = await transporter.sendMail(mailOptions);
      logger.info(`📧 Verification email sent successfully to: ${email}`);
      logger.info(`📧 Message ID: ${result.messageId}`);
      
      return true;
      
    } catch (error) {
      logger.error('📧 Failed to send verification email:', error);
      throw error;
    }
  }

  static async sendPasswordResetEmail(email, fullName, token) {
    try {
      const transporter = await this.initializeTransporter();
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
      
      const mailOptions = {
        from: 'SwarmFill Network <your-email@gmail.com>', // Replace with your Gmail
        to: email,
        subject: 'Reset Your SwarmFill Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hi ${fullName},</p>
            <p>You requested to reset your password for your SwarmFill account. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p><strong>This link will expire in 15 minutes.</strong></p>
            <p>If you didn't request this reset, please ignore this email and your password will remain unchanged.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">This email was sent by SwarmFill Network</p>
          </div>
        `
      };

      // Send the actual email
      const result = await transporter.sendMail(mailOptions);
      logger.info(`📧 Password reset email sent successfully to: ${email}`);
      logger.info(`📧 Message ID: ${result.messageId}`);
      
      return true;
      
    } catch (error) {
      logger.error('📧 Failed to send password reset email:', error);
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
