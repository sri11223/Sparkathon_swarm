const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255]
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    subcategory: {
      type: DataTypes.STRING(100)
    },
    brand: {
      type: DataTypes.STRING(100)
    },
    barcode: {
      type: DataTypes.STRING(50),
      unique: true
    },
    sku: {
      type: DataTypes.STRING(50),
      unique: true
    },
    unit: {
      type: DataTypes.STRING(20), // kg, liters, pieces, etc.
      defaultValue: 'pieces'
    },
    weight: {
      type: DataTypes.DECIMAL(8, 3) // in kg
    },
    dimensions: {
      type: DataTypes.JSON, // {length, width, height} in cm
      defaultValue: {}
    },
    image_url: {
      type: DataTypes.STRING(500)
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    nutritional_info: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    is_perishable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    shelf_life_days: {
      type: DataTypes.INTEGER // days
    },
    storage_temperature: {
      type: DataTypes.ENUM('frozen', 'refrigerated', 'room_temperature'),
      defaultValue: 'room_temperature'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    created_by: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_product_category',
        fields: ['category', 'subcategory']
      },
      {
        name: 'idx_product_barcode',
        fields: ['barcode']
      },
      {
        name: 'idx_product_search',
        fields: ['name', 'brand']
      }
    ]
  });

  return Product;
};
