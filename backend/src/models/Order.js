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
      // An order has many order items
      Order.hasMany(models.OrderItem, {
        foreignKey: 'order_id',
        as: 'orderItems'
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
    courier_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    delivery_address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    delivery_latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false
    },
    delivery_longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        isIn: [['pending', 'confirmed', 'ready_for_pickup', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'failed']],
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
    courier_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estimated_delivery_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true
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