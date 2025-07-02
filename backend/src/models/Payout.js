const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Payout extends Model {
    static associate(models) {
      Payout.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
      Payout.hasMany(models.Transaction, {
        foreignKey: 'payout_id',
        as: 'transactions',
      });
    }
  }

  Payout.init({
    payout_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    payout_method_details: {
      type: DataTypes.JSONB, // Store details of the payout method (e.g., last 4 digits of bank account)
    },
    processing_date: {
      type: DataTypes.DATE,
    },
    completion_date: {
      type: DataTypes.DATE,
    },
  }, {
    sequelize,
    modelName: 'Payout',
    tableName: 'payouts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Payout;
};
