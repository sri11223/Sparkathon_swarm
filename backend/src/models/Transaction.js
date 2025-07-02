const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Transaction extends Model {
    static associate(models) {
      Transaction.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
      Transaction.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order',
      });
      Transaction.belongsTo(models.Payout, {
        foreignKey: 'payout_id',
        as: 'payout',
      });
    }
  }

  Transaction.init({
    transaction_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    order_id: {
      type: DataTypes.UUID,
    },
    payout_id: {
      type: DataTypes.UUID,
    },
    type: {
      type: DataTypes.ENUM('sale', 'delivery_fee', 'hub_fee', 'platform_fee', 'payout', 'refund'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  return Transaction;
};
