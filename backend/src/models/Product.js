const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Product extends Model {
    static associate(models) {
      // A product can be in many hubs
      Product.belongsToMany(models.Hub, {
        through: 'hub_inventory',
        foreignKey: 'product_id',
        otherKey: 'hub_id',
        as: 'hubs'
      });
      // A product can be part of many orders
      Product.belongsToMany(models.Order, {
        through: 'order_items',
        foreignKey: 'product_id',
        otherKey: 'order_id',
        as: 'orders'
      });
    }
  }

  Product.init({
    product_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    sku: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    volume_m3: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    image_url: {
      type: DataTypes.TEXT,
    },
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Product;
};