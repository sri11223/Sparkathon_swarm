const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SystemConfiguration = sequelize.define('SystemConfiguration', {
    config_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    config_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isLowercase: true
      }
    },
    config_value: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    data_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['string', 'number', 'boolean', 'json', 'array']]
      }
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['general', 'payment', 'notification', 'ai', 'crisis', 'delivery', 'hub', 'user']]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_sensitive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    requires_restart: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    }
  }, {
    tableName: 'system_configurations',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        name: 'idx_system_configurations_key',
        fields: ['config_key'],
        unique: true
      },
      {
        name: 'idx_system_configurations_category',
        fields: ['category']
      },
      {
        name: 'idx_system_configurations_sensitive',
        fields: ['is_sensitive']
      }
    ]
  });

  // Instance methods
  SystemConfiguration.prototype.getValue = function() {
    switch (this.data_type) {
      case 'number':
        return parseFloat(this.config_value);
      case 'boolean':
        return this.config_value.toLowerCase() === 'true';
      case 'json':
        try {
          return JSON.parse(this.config_value);
        } catch (e) {
          console.error(`Error parsing JSON config ${this.config_key}:`, e);
          return null;
        }
      case 'array':
        try {
          const parsed = JSON.parse(this.config_value);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.error(`Error parsing array config ${this.config_key}:`, e);
          return [];
        }
      case 'string':
      default:
        return this.config_value;
    }
  };

  SystemConfiguration.prototype.setValue = function(value) {
    switch (this.data_type) {
      case 'number':
        if (typeof value !== 'number') {
          throw new Error('Value must be a number');
        }
        this.config_value = value.toString();
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new Error('Value must be a boolean');
        }
        this.config_value = value.toString();
        break;
      case 'json':
      case 'array':
        if (this.data_type === 'array' && !Array.isArray(value)) {
          throw new Error('Value must be an array');
        }
        this.config_value = JSON.stringify(value);
        break;
      case 'string':
      default:
        this.config_value = value.toString();
        break;
    }
  };

  SystemConfiguration.prototype.getDisplayValue = function() {
    if (this.is_sensitive) {
      return '***HIDDEN***';
    }
    return this.getValue();
  };

  // Static methods
  SystemConfiguration.get = async function(key, defaultValue = null) {
    const config = await this.findOne({
      where: { config_key: key }
    });
    
    return config ? config.getValue() : defaultValue;
  };

  SystemConfiguration.set = async function(key, value, updatedBy = null) {
    const config = await this.findOne({
      where: { config_key: key }
    });
    
    if (!config) {
      throw new Error(`Configuration key '${key}' not found`);
    }
    
    config.setValue(value);
    config.updated_by = updatedBy;
    await config.save();
    
    return config;
  };

  SystemConfiguration.getByCategory = async function(category) {
    return await this.findAll({
      where: { category },
      order: [['config_key', 'ASC']]
    });
  };

  SystemConfiguration.getAllConfigs = async function(includeSensitive = false) {
    const whereClause = includeSensitive ? {} : { is_sensitive: false };
    
    return await this.findAll({
      where: whereClause,
      order: [['category', 'ASC'], ['config_key', 'ASC']]
    });
  };

  SystemConfiguration.createDefault = async function(key, value, dataType, category, description = null, options = {}) {
    return await this.create({
      config_key: key,
      config_value: dataType === 'json' || dataType === 'array' ? JSON.stringify(value) : value.toString(),
      data_type: dataType,
      category,
      description,
      is_sensitive: options.is_sensitive || false,
      requires_restart: options.requires_restart || false
    });
  };

  SystemConfiguration.bulkSet = async function(configs, updatedBy = null) {
    const results = [];
    
    for (const [key, value] of Object.entries(configs)) {
      try {
        const result = await this.set(key, value, updatedBy);
        results.push({ key, success: true, config: result });
      } catch (error) {
        results.push({ key, success: false, error: error.message });
      }
    }
    
    return results;
  };

  SystemConfiguration.getConfigsRequiringRestart = async function() {
    return await this.findAll({
      where: { requires_restart: true },
      attributes: ['config_key', 'description', 'updated_at'],
      order: [['updated_at', 'DESC']]
    });
  };

  // Common configuration getters
  SystemConfiguration.getDeliverySettings = async function() {
    return {
      maxDeliveryRadius: await this.get('max_delivery_radius_km', 25),
      minOrderAmount: await this.get('min_order_amount', 10),
      deliveryFee: await this.get('base_delivery_fee', 3.99),
      freeDeliveryThreshold: await this.get('free_delivery_threshold', 35),
      maxDeliveryTime: await this.get('max_delivery_time_hours', 4)
    };
  };

  SystemConfiguration.getPaymentSettings = async function() {
    return {
      stripePublicKey: await this.get('stripe_public_key'),
      processingFeePercentage: await this.get('payment_processing_fee_percent', 2.9),
      hubOwnerCommission: await this.get('hub_owner_commission_percent', 15),
      courierBaseRate: await this.get('courier_base_rate_per_km', 2.5)
    };
  };

  SystemConfiguration.getAISettings = async function() {
    return {
      enableRouteOptimization: await this.get('ai_route_optimization_enabled', true),
      enableInventoryPrediction: await this.get('ai_inventory_prediction_enabled', true),
      optimizationTimeout: await this.get('ai_optimization_timeout_seconds', 30),
      minimumConfidenceScore: await this.get('ai_minimum_confidence_score', 0.7)
    };
  };

  return SystemConfiguration;
};
