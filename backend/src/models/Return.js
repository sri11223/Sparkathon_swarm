const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Return = sequelize.define('Return', {
    return_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'order_id'
      }
    },
    order_item_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'order_items',
        key: 'item_id'
      }
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    reason: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [5, 200]
      }
    },
    detailed_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    return_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    refund_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    return_status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed', 'refunded'),
      defaultValue: 'pending'
    },
    return_method: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['walmart_store', 'hub_pickup', 'courier_pickup']]
      }
    },
    processed_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    processing_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    requested_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    refunded_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'returns',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        name: 'idx_returns_customer_id',
        fields: ['customer_id']
      },
      {
        name: 'idx_returns_status',
        fields: ['return_status']
      },
      {
        name: 'idx_returns_order_id',
        fields: ['order_id']
      },
      {
        name: 'idx_returns_requested_at',
        fields: ['requested_at']
      }
    ]
  });

  // Instance methods
  Return.prototype.canBeProcessed = function() {
    return this.return_status === 'pending';
  };

  Return.prototype.approve = function(processedBy, notes = null) {
    if (!this.canBeProcessed()) {
      throw new Error('Return cannot be processed in current status');
    }
    
    this.return_status = 'approved';
    this.processed_by = processedBy;
    this.processing_notes = notes;
    this.processed_at = new Date();
  };

  Return.prototype.reject = function(processedBy, notes) {
    if (!this.canBeProcessed()) {
      throw new Error('Return cannot be processed in current status');
    }
    
    this.return_status = 'rejected';
    this.processed_by = processedBy;
    this.processing_notes = notes;
    this.processed_at = new Date();
  };

  Return.prototype.complete = function() {
    if (this.return_status !== 'approved') {
      throw new Error('Return must be approved before completion');
    }
    
    this.return_status = 'completed';
  };

  Return.prototype.processRefund = function() {
    if (this.return_status !== 'completed') {
      throw new Error('Return must be completed before refund');
    }
    
    this.return_status = 'refunded';
    this.refunded_at = new Date();
  };

  Return.prototype.isExpired = function(daysLimit = 30) {
    const expiryDate = new Date(this.requested_at);
    expiryDate.setDate(expiryDate.getDate() + daysLimit);
    return new Date() > expiryDate;
  };

  Return.prototype.getProcessingTime = function() {
    if (!this.processed_at) return null;
    
    const requestedTime = new Date(this.requested_at);
    const processedTime = new Date(this.processed_at);
    const diffInMs = processedTime - requestedTime;
    
    return {
      hours: Math.floor(diffInMs / (1000 * 60 * 60)),
      days: Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    };
  };

  Return.prototype.getRefundTime = function() {
    if (!this.refunded_at || !this.processed_at) return null;
    
    const processedTime = new Date(this.processed_at);
    const refundedTime = new Date(this.refunded_at);
    const diffInMs = refundedTime - processedTime;
    
    return {
      hours: Math.floor(diffInMs / (1000 * 60 * 60)),
      days: Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    };
  };

  // Static methods
  Return.getReturnStatistics = async function(timeframe = 'month') {
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const stats = await this.findAll({
      where: {
        requested_at: {
          [sequelize.Sequelize.Op.gte]: startDate
        }
      },
      attributes: [
        'return_status',
        [sequelize.fn('COUNT', sequelize.col('return_id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('refund_amount')), 'total_refund_amount']
      ],
      group: ['return_status'],
      raw: true
    });

    return stats;
  };

  Return.getCustomerReturnHistory = async function(customerId, limit = 10) {
    return await this.findAll({
      where: { customer_id: customerId },
      order: [['requested_at', 'DESC']],
      limit,
      include: [
        {
          model: sequelize.models.Order,
          as: 'order',
          attributes: ['order_id', 'order_number']
        },
        {
          model: sequelize.models.OrderItem,
          as: 'orderItem',
          include: [{
            model: sequelize.models.Product,
            as: 'product',
            attributes: ['product_id', 'name', 'category']
          }]
        }
      ]
    });
  };

  return Return;
};
