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
        full_name,
        phone,
        user_type,
        address,
        latitude,
        longitude,
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

      // Create user
      const userData = {
        email,
        password_hash: password, // Will be hashed by model hook
        full_name,
        phone,
        user_type,
        address,
        latitude,
        longitude,
        verification_token
      };

      // Add courier-specific fields
      if (user_type === 'courier') {
        userData.vehicle_type = vehicle_type;
        userData.license_number = license_number;
      }

      const user = await User.create(userData);

      // Send verification email
      try {
        await sendVerificationEmail(user.email, user.full_name, verification_token);
      } catch (emailError) {
        logger.error('Failed to send verification email:', emailError);
        // Don't fail registration if email fails
      }

      // Generate JWT token
      const token = generateToken(user.id);

      logger.info(`New user registered: ${user.email} (${user.user_type})`);

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

      // Validate password
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
      const token = generateToken(user.id);

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

      const user = await User.findOne({ where: { verification_token: token } });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token'
        });
      }

      // Update user as verified
      await user.update({
        is_verified: true,
        verification_token: null
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
        reset_password_token: reset_token,
        reset_password_expires: reset_expires
      });

      // Send password reset email
      try {
        await sendPasswordResetEmail(user.email, user.full_name, reset_token);
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
          reset_password_token: token,
          reset_password_expires: {
            $gt: new Date()
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
        reset_password_token: null,
        reset_password_expires: null
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
      const token = generateToken(user.id);

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
