const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class OrderVoucher extends Model {
    static associate(models) {
      // This is a join table, associations are defined in Order and Voucher models
    }
  }

  OrderVoucher.init({
    order_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    voucher_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    discount_applied: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'OrderVoucher',
    tableName: 'order_vouchers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  return OrderVoucher;
};
