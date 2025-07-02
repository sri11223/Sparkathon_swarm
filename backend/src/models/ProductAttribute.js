const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ProductAttribute extends Model {
    static associate(models) {
      ProductAttribute.belongsToMany(models.Product, {
        through: 'product_attribute_values',
        foreignKey: 'attribute_id',
        otherKey: 'product_id',
        as: 'products',
      });
    }
  }

  ProductAttribute.init({
    attribute_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // e.g., 'Color', 'Size', 'Brand'
    },
  }, {
    sequelize,
    modelName: 'ProductAttribute',
    tableName: 'product_attributes',
    timestamps: false,
  });

  return ProductAttribute;
};
