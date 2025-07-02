const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Payment extends Model {
    static associate(models) {
      // A payment belongs to one order
      Payment.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
      });
      // A payment belongs to one user
      Payment.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }

  Payment.init({
    payment_id: {
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'processing', 'completed', 'failed', 'refunded']]
      }
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    stripe_payment_intent_id: {
      type: DataTypes.STRING(255)
    },
    stripe_charge_id: {
      type: DataTypes.STRING(255)
    },
    transaction_id: {
      type: DataTypes.STRING(255)
    },
    payment_gateway: {
      type: DataTypes.STRING(50),
      defaultValue: 'stripe'
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    processed_at: {
      type: DataTypes.DATE
    },
    failed_reason: {
      type: DataTypes.TEXT
    },
    refund_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    refunded_at: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Payment;
};
