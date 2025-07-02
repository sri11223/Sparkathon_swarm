const { 
  SystemConfiguration 
} = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Get all system configurations
 */
const getSystemConfigurations = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { category, active_only = 'true' } = req.query;

    let whereClause = {};
    if (category) {
      whereClause.category = category;
    }
    if (active_only === 'true') {
      whereClause.is_active = true;
    }

    const configurations = await SystemConfiguration.findAll({
      where: whereClause,
      order: [['category', 'ASC'], ['config_key', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        configurations,
        total: configurations.length
      }
    });
  } catch (error) {
    console.error('Get system configurations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch system configurations' 
    });
  }
};

/**
 * Get configuration by key
 */
const getConfigurationByKey = async (req, res) => {
  try {
    const { key } = req.params;

    // Allow certain configurations to be accessed by non-admins
    const publicConfigs = [
      'app_version',
      'maintenance_mode',
      'api_rate_limit',
      'supported_payment_methods',
      'delivery_time_slots',
      'minimum_order_amount',
      'delivery_charges',
      'currency',
      'timezone'
    ];

    if (!publicConfigs.includes(key) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const configuration = await SystemConfiguration.findOne({
      where: { 
        config_key: key,
        is_active: true
      }
    });

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }

    res.json({
      success: true,
      data: configuration
    });
  } catch (error) {
    console.error('Get configuration by key error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch configuration' 
    });
  }
};

/**
 * Create system configuration
 */
const createSystemConfiguration = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
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
      config_key,
      config_value,
      category,
      description,
      data_type,
      allowed_values,
      is_sensitive,
      requires_restart
    } = req.body;

    // Check if configuration already exists
    const existingConfig = await SystemConfiguration.findOne({
      where: { config_key }
    });

    if (existingConfig) {
      return res.status(400).json({
        success: false,
        message: 'Configuration with this key already exists'
      });
    }

    const configuration = await SystemConfiguration.create({
      config_key,
      config_value,
      category,
      description,
      data_type: data_type || 'string',
      allowed_values: allowed_values || [],
      is_active: true,
      is_sensitive: is_sensitive || false,
      requires_restart: requires_restart || false,
      created_by: req.user.id,
      updated_by: req.user.id
    });

    res.status(201).json({
      success: true,
      data: configuration,
      message: 'System configuration created successfully'
    });
  } catch (error) {
    console.error('Create system configuration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create system configuration' 
    });
  }
};

/**
 * Update system configuration
 */
const updateSystemConfiguration = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const configuration = await SystemConfiguration.findByPk(id);
    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }

    // Validate data type if config_value is being updated
    if (updateData.config_value !== undefined) {
      const isValid = validateConfigValue(
        updateData.config_value, 
        configuration.data_type, 
        configuration.allowed_values
      );

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid configuration value for the specified data type'
        });
      }
    }

    // Store previous value for audit
    const previousValue = configuration.config_value;

    updateData.updated_by = req.user.id;
    updateData.updated_at = new Date();

    await configuration.update(updateData);

    // Log the configuration change
    console.log(`Configuration updated: ${configuration.config_key}`, {
      previous_value: previousValue,
      new_value: configuration.config_value,
      updated_by: req.user.id,
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: configuration,
      message: 'System configuration updated successfully'
    });
  } catch (error) {
    console.error('Update system configuration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update system configuration' 
    });
  }
};

/**
 * Delete system configuration
 */
const deleteSystemConfiguration = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { id } = req.params;

    const configuration = await SystemConfiguration.findByPk(id);
    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }

    // Check if this is a critical configuration that shouldn't be deleted
    const criticalConfigs = [
      'app_version',
      'database_version',
      'encryption_key',
      'jwt_secret'
    ];

    if (criticalConfigs.includes(configuration.config_key)) {
      return res.status(400).json({
        success: false,
        message: 'This configuration cannot be deleted as it is critical for system operation'
      });
    }

    await configuration.destroy();

    res.json({
      success: true,
      message: 'System configuration deleted successfully'
    });
  } catch (error) {
    console.error('Delete system configuration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete system configuration' 
    });
  }
};

/**
 * Toggle configuration active status
 */
const toggleConfigurationStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { id } = req.params;

    const configuration = await SystemConfiguration.findByPk(id);
    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }

    await configuration.update({
      is_active: !configuration.is_active,
      updated_by: req.user.id,
      updated_at: new Date()
    });

    res.json({
      success: true,
      data: configuration,
      message: `Configuration ${configuration.is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle configuration status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to toggle configuration status' 
    });
  }
};

/**
 * Get configurations by category
 */
const getConfigurationsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // Allow certain categories to be accessed by non-admins
    const publicCategories = [
      'general',
      'delivery',
      'payment',
      'app'
    ];

    if (!publicCategories.includes(category) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const configurations = await SystemConfiguration.findAll({
      where: { 
        category,
        is_active: true
      },
      order: [['config_key', 'ASC']]
    });

    // Filter out sensitive configurations for non-admins
    const filteredConfigs = req.user.role === 'admin' 
      ? configurations 
      : configurations.filter(config => !config.is_sensitive);

    res.json({
      success: true,
      data: {
        category,
        configurations: filteredConfigs,
        total: filteredConfigs.length
      }
    });
  } catch (error) {
    console.error('Get configurations by category error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch configurations' 
    });
  }
};

/**
 * Bulk update configurations
 */
const bulkUpdateConfigurations = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { configurations } = req.body;

    if (!Array.isArray(configurations) || configurations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'configurations must be a non-empty array'
      });
    }

    const results = [];
    const errors = [];

    for (const configUpdate of configurations) {
      try {
        const { config_key, config_value } = configUpdate;
        
        const config = await SystemConfiguration.findOne({
          where: { config_key }
        });

        if (!config) {
          errors.push(`Configuration not found: ${config_key}`);
          continue;
        }

        // Validate value
        const isValid = validateConfigValue(
          config_value, 
          config.data_type, 
          config.allowed_values
        );

        if (!isValid) {
          errors.push(`Invalid value for ${config_key}`);
          continue;
        }

        await config.update({
          config_value,
          updated_by: req.user.id,
          updated_at: new Date()
        });

        results.push({
          config_key,
          previous_value: config.config_value,
          new_value: config_value,
          status: 'updated'
        });
      } catch (error) {
        errors.push(`Error updating ${configUpdate.config_key}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      data: {
        updated: results,
        errors: errors,
        total_processed: configurations.length,
        successful_updates: results.length
      },
      message: `Bulk update completed. ${results.length} configurations updated, ${errors.length} errors`
    });
  } catch (error) {
    console.error('Bulk update configurations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to bulk update configurations' 
    });
  }
};

/**
 * Export configurations (Admin only)
 */
const exportConfigurations = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { include_sensitive = 'false' } = req.query;

    let whereClause = {};
    if (include_sensitive === 'false') {
      whereClause.is_sensitive = false;
    }

    const configurations = await SystemConfiguration.findAll({
      where: whereClause,
      attributes: ['config_key', 'config_value', 'category', 'description', 'data_type'],
      order: [['category', 'ASC'], ['config_key', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        configurations,
        exported_at: new Date(),
        total: configurations.length
      }
    });
  } catch (error) {
    console.error('Export configurations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export configurations' 
    });
  }
};

/**
 * Helper function to validate configuration values
 */
const validateConfigValue = (value, dataType, allowedValues) => {
  try {
    switch (dataType) {
      case 'boolean':
        return typeof value === 'boolean' || value === 'true' || value === 'false';
      case 'number':
        return !isNaN(Number(value));
      case 'integer':
        return Number.isInteger(Number(value));
      case 'float':
        return !isNaN(parseFloat(value));
      case 'array':
        return Array.isArray(value) || (typeof value === 'string' && value.startsWith('['));
      case 'object':
        return typeof value === 'object' || (typeof value === 'string' && value.startsWith('{'));
      case 'enum':
        return allowedValues && allowedValues.includes(value);
      case 'string':
      default:
        return typeof value === 'string' || value !== null;
    }
  } catch (error) {
    return false;
  }
};

module.exports = {
  getSystemConfigurations,
  getConfigurationByKey,
  createSystemConfiguration,
  updateSystemConfiguration,
  deleteSystemConfiguration,
  toggleConfigurationStatus,
  getConfigurationsByCategory,
  bulkUpdateConfigurations,
  exportConfigurations
};
