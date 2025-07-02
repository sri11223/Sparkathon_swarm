const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class HubInventory extends Model {
    static associate(models) {
      // No direct associations needed here as it's a through model.
      // The associations are defined in the Hub and Product models.
    }
  }

  HubInventory.init({
    hub_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: 'hubs',
        key: 'hub_id'
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
        min: 0
      }
    },
    available_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    last_stocked_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'HubInventory',
    tableName: 'hub_inventory',
    timestamps: false, // We have a manual timestamp `last_stocked_at`
  });

  return HubInventory;
};
