const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ProductCategory extends Model {
    static associate(models) {
      ProductCategory.belongsTo(models.ProductCategory, {
        as: 'parent',
        foreignKey: 'parent_category_id',
      });
      ProductCategory.hasMany(models.ProductCategory, {
        as: 'children',
        foreignKey: 'parent_category_id',
      });
      ProductCategory.belongsToMany(models.Product, {
        through: 'product_category_map',
        foreignKey: 'category_id',
        otherKey: 'product_id',
        as: 'products',
      });
    }
  }

  ProductCategory.init({
    category_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    parent_category_id: {
      type: DataTypes.UUID,
      references: {
        model: 'product_categories',
        key: 'category_id',
      },
    },
  }, {
    sequelize,
    modelName: 'ProductCategory',
    tableName: 'product_categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return ProductCategory;
};
