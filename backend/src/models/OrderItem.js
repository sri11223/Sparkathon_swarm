const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class OrderItem extends Model {
    static associate(models) {
      // OrderItem belongs to an Order
      OrderItem.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
      });
      // OrderItem belongs to a Product
      OrderItem.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
    }
  }

  OrderItem.init({
    order_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: 'orders',
        key: 'order_id'
      }
    },
    product_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: 'products',
        key: 'product_id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    price_per_unit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    timestamps: false,
  });

  return OrderItem;
};