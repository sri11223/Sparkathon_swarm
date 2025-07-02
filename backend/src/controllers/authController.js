const crypto = require('crypto');
const { User } = require('../models');
const { generateToken } = require('../middleware/auth');
const logger = require('../utils/logger');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      const {
        email,
        password,
        first_name,
        last_name,
        middle_name,
        phone_number,
        role,
        vehicle_type,
        license_number
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Generate verification token
      const verification_token = crypto.randomBytes(32).toString('hex');

      // Create user data matching the database schema
      const userData = {
        email,
        password_hash: password, // Will be hashed by model hook
        first_name,
        last_name,
        middle_name,
        phone_number,
        role,
        email_verification_token: verification_token,
        email_verification_expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        is_email_verified: false
      };

      // Add courier-specific fields if needed (these would be in a separate CourierVehicle table)
      // For now, we'll skip vehicle_type and license_number as they're not in the User model

      const user = await User.create(userData);

      // Send verification email
      try {
        await sendVerificationEmail(user.email, `${user.first_name} ${user.last_name}`, verification_token);
      } catch (emailError) {
        logger.error('Failed to send verification email:', emailError);
        // Don't fail registration if email fails
      }

      // Generate JWT token
      const token = generateToken(user.user_id); // Use user_id instead of id

      logger.info(`New user registered: ${user.email} (${user.role})`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        data: {
          token,
          user: user.toJSON()
        }
      });

    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user with email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if account is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated. Please contact support.'
        });
      }

      // Validate password using bcrypt
      const isValidPassword = await user.validatePassword(password);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Update last login
      await user.update({ last_login: new Date() });

      // Generate JWT token
      const token = generateToken(user.user_id);

      logger.info(`User logged in: ${user.email}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: user.toJSON()
        }
      });

    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Verify email
  static async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      const user = await User.findOne({ 
        where: { 
          email_verification_token: token,
          email_verification_expires: {
            [require('sequelize').Op.gt]: new Date()
          }
        } 
      });
      
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token'
        });
      }

      // Update user as verified
      await user.update({
        is_email_verified: true,
        email_verification_token: null,
        email_verification_expires: null
      });

      logger.info(`Email verified for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Email verified successfully',
        data: {
          user: user.toJSON()
        }
      });

    } catch (error) {
      logger.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Email verification failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Request password reset
  static async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        // Don't reveal if email exists
        return res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent.'
        });
      }

      // Generate reset token
      const reset_token = crypto.randomBytes(32).toString('hex');
      const reset_expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await user.update({
        password_reset_token: reset_token,
        password_reset_expires: reset_expires
      });

      // Send password reset email
      try {
        await sendPasswordResetEmail(user.email, `${user.first_name} ${user.last_name}`, reset_token);
      } catch (emailError) {
        logger.error('Failed to send password reset email:', emailError);
        return res.status(500).json({
          success: false,
          message: 'Failed to send password reset email'
        });
      }

      logger.info(`Password reset requested for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Password reset link has been sent to your email.'
      });

    } catch (error) {
      logger.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        message: 'Password reset request failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Reset password
  static async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await User.findOne({
        where: {
          password_reset_token: token,
          password_reset_expires: {
            [require('sequelize').Op.gt]: new Date()
          }
        }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      // Update password and clear reset tokens
      await user.update({
        password_hash: password, // Will be hashed by model hook
        password_reset_token: null,
        password_reset_expires: null
      });

      logger.info(`Password reset completed for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Password reset successful'
      });

    } catch (error) {
      logger.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        message: 'Password reset failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Change password (for authenticated users)
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = req.user;

      // Validate current password
      const isValidPassword = await user.validatePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      await user.update({ password_hash: newPassword });

      logger.info(`Password changed for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      logger.error('Password change error:', error);
      res.status(500).json({
        success: false,
        message: 'Password change failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Refresh token
  static async refreshToken(req, res) {
    try {
      const user = req.user;

      // Generate new token
      const token = generateToken(user.user_id);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token,
          user: user.toJSON()
        }
      });

    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        message: 'Token refresh failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = req.user;

      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user: user.toJSON()
        }
      });

    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = AuthController;
