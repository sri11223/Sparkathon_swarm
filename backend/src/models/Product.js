const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Product extends Model {
    static associate(models) {
      // A product has many inventory entries
      Product.hasMany(models.Inventory, {
        foreignKey: 'product_id',
        as: 'inventoryEntries'
      });
      // A product can be part of many order items
      Product.hasMany(models.OrderItem, {
        foreignKey: 'product_id',
        as: 'orderItems'
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
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    base_price: {
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
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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