const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    order_number: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    hub_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'hubs',
        key: 'id'
      }
    },
    courier_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM(
        'pending',        // Order placed, waiting for hub confirmation
        'confirmed',      // Hub confirmed, preparing items
        'ready',          // Items ready for pickup
        'assigned',       // Courier assigned
        'picked_up',      // Courier picked up from hub
        'in_transit',     // On the way to customer
        'delivered',      // Successfully delivered
        'cancelled',      // Cancelled by customer/hub
        'refunded'        // Payment refunded
      ),
      defaultValue: 'pending'
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    delivery_fee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    service_fee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    tax_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    delivery_address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    delivery_lat: {
      type: DataTypes.DECIMAL(10, 8)
    },
    delivery_lng: {
      type: DataTypes.DECIMAL(11, 8)
    },
    delivery_instructions: {
      type: DataTypes.TEXT
    },
    pickup_code: {
      type: DataTypes.STRING(10)
    },
    estimated_delivery: {
      type: DataTypes.DATE
    },
    actual_pickup_time: {
      type: DataTypes.DATE
    },
    actual_delivery_time: {
      type: DataTypes.DATE
    },
    payment_method: {
      type: DataTypes.ENUM('card', 'cash', 'digital_wallet'),
      defaultValue: 'card'
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending'
    },
    payment_intent_id: {
      type: DataTypes.STRING // Stripe/payment gateway reference
    },
    notes: {
      type: DataTypes.TEXT
    },
    cancellation_reason: {
      type: DataTypes.TEXT
    },
    rating: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 5
      }
    },
    review: {
      type: DataTypes.TEXT
    },
    delivery_distance: {
      type: DataTypes.DECIMAL(8, 2) // in km
    },
    estimated_prep_time: {
      type: DataTypes.INTEGER // in minutes
    }
  }, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (order) => {
        // Generate unique order number
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substr(2, 5).toUpperCase();
        order.order_number = `SF${timestamp.slice(-6)}${random}`;
        
        // Generate pickup code
        order.pickup_code = Math.random().toString(36).substr(2, 6).toUpperCase();
      }
    },
    indexes: [
      {
        name: 'idx_order_customer',
        fields: ['customer_id']
      },
      {
        name: 'idx_order_hub',
        fields: ['hub_id']
      },
      {
        name: 'idx_order_courier',
        fields: ['courier_id']
      },
      {
        name: 'idx_order_status',
        fields: ['status']
      },
      {
        name: 'idx_order_number',
        fields: ['order_number']
      }
    ]
  });

  // Instance methods
  Order.prototype.canBeCancelled = function() {
    return ['pending', 'confirmed'].includes(this.status);
  };

  Order.prototype.canBeModified = function() {
    return this.status === 'pending';
  };

  Order.prototype.calculateDeliveryTime = function() {
    if (this.actual_delivery_time && this.created_at) {
      return Math.round((this.actual_delivery_time - this.created_at) / (1000 * 60)); // minutes
    }
    return null;
  };

  Order.prototype.getStatusMessage = function() {
    const statusMessages = {
      pending: 'Order placed, waiting for confirmation',
      confirmed: 'Order confirmed, preparing your items',
      ready: 'Order ready for pickup',
      assigned: 'Courier assigned to your order',
      picked_up: 'Order picked up, on the way',
      in_transit: 'Order is on the way to you',
      delivered: 'Order delivered successfully',
      cancelled: 'Order has been cancelled',
      refunded: 'Order refunded'
    };
    return statusMessages[this.status] || 'Unknown status';
  };

  return Order;
};
