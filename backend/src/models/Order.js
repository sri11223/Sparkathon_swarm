const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Order extends Model {
    static associate(models) {
      // An order belongs to one customer (User)
      Order.belongsTo(models.User, { 
        foreignKey: 'customer_id',
        as: 'customer'
      });
      // An order is fulfilled by one hub
      Order.belongsTo(models.Hub, {
        foreignKey: 'hub_id',
        as: 'hub'
      });
      // An order can have many products
      Order.belongsToMany(models.Product, {
        through: 'order_items',
        foreignKey: 'order_id',
        otherKey: 'product_id',
        as: 'products'
      });
      // An order has one delivery record associated with it
      Order.hasOne(models.Delivery, {
        foreignKey: 'order_id',
        as: 'delivery'
      });
    }
  }

  Order.init({
    order_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    hub_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'hubs',
        key: 'hub_id'
      }
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        isIn: [['pending', 'confirmed', 'ready_for_pickup', 'out_for_delivery', 'completed', 'cancelled']],
      },
    },
    order_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['delivery', 'drive_thru_pickup']],
      },
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    pickup_code: {
      type: DataTypes.STRING(10),
    },
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Order;
};