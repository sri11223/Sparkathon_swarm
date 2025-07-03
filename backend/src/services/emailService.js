const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Real email service using nodemailer
class EmailService {
  static transporter = null;

  static async initializeTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
  auth: {
    user: 'nutalapatisrikrishna85@gmail.com',
    pass: 'qjglarstehpfrenx'
  },
  tls: {
    rejectUnauthorized: false // Don't use this in production
  }
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
  static async sendVerificationEmail(email, fullName, otp) {
    try {
      const transporter = await this.initializeTransporter();
      
      const mailOptions = {
        from: 'SwarmFill Network <nutalapatisrikrishna85@gmail.com>',
        to: email,
        subject: 'Verify Your SwarmFill Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to SwarmFill, ${fullName}!</h2>
            <p>Thank you for registering with SwarmFill Network. Use the following One-Time Password (OTP) to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0; font-size: 24px; font-weight: bold; color: #007bff;">
              ${otp}
            </div>
            <p><strong>This OTP will expire in 15 minutes.</strong></p>
            <p>If you didn't create this account, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">This email was sent by SwarmFill Network</p>
          </div>
        `
      };

      // Send the actual email
      const result = await transporter.sendMail(mailOptions);
      logger.info(`📧 Verification OTP sent successfully to: ${email}`);
      logger.info(`📧 Message ID: ${result.messageId}`);
      
      return true;
      
    } catch (error) {
      logger.error('📧 Failed to send verification email:', error);
      throw error;
    }
  }

  static async sendPasswordResetEmail(email, fullName, otp) {
    try {
      const transporter = await this.initializeTransporter();
      
      const mailOptions = {
        from: 'SwarmFill Network <your-email@gmail.com>', // Replace with your Gmail
        to: email,
        subject: 'Reset Your SwarmFill Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hi ${fullName},</p>
            <p>You requested to reset your password for your SwarmFill account. Use the following One-Time Password (OTP) to reset your password:</p>
            <div style="text-align: center; margin: 30px 0; font-size: 24px; font-weight: bold; color: #dc3545;">
              ${otp}
            </div>
            <p><strong>This OTP will expire in 15 minutes.</strong></p>
            <p>If you didn't request this reset, please ignore this email and your password will remain unchanged.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">This email was sent by SwarmFill Network</p>
          </div>
        `
      };

      // Send the actual email
      const result = await transporter.sendMail(mailOptions);
      logger.info(`📧 Password reset OTP sent successfully to: ${email}`);
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

module.exports = EmailService;
