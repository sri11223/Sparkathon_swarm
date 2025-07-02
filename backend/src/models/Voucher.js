const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Voucher extends Model {
    static associate(models) {
      Voucher.belongsToMany(models.Order, {
        through: 'order_vouchers',
        foreignKey: 'voucher_id',
        otherKey: 'order_id',
        as: 'orders'
      });
    }
  }

  Voucher.init({
    voucher_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    discount_type: {
      type: DataTypes.ENUM('percentage', 'fixed_amount'),
      allowNull: false,
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    max_uses: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    current_uses: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Voucher',
    tableName: 'vouchers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Voucher;
};
