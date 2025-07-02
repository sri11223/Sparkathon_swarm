const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ProductAttributeValue extends Model {}

  ProductAttributeValue.init({
    product_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: 'products',
        key: 'product_id',
      },
    },
    attribute_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: 'product_attributes',
        key: 'attribute_id',
      },
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false, // e.g., 'Red', 'Large', 'Acme'
    },
  }, {
    sequelize,
    modelName: 'ProductAttributeValue',
    tableName: 'product_attribute_values',
    timestamps: false,
  });

  return ProductAttributeValue;
};
