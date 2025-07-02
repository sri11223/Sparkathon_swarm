const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class StockoutEvent extends Model {
    static associate(models) {
      StockoutEvent.belongsTo(models.Hub, {
        foreignKey: 'hub_id',
        as: 'hub'
      });
      StockoutEvent.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
    }
  }

  StockoutEvent.init({
    stockout_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    hub_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    stockout_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    restock_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    potential_lost_sales_units: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'StockoutEvent',
    tableName: 'stockout_events',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return StockoutEvent;
};
