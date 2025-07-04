const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Delivery extends Model {
    static associate(models) {
      // A delivery is for one order
      Delivery.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
      });
      // A delivery is handled by one courier (User)
      Delivery.belongsTo(models.User, {
        foreignKey: 'courier_id',
        as: 'courier'
      });
      Delivery.belongsTo(models.CourierVehicle, {
        foreignKey: 'vehicle_id',
        as: 'vehicle'
      });
    }
  }

  Delivery.init({
    delivery_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // An order should only have one delivery record
      references: {
        model: 'orders',
        key: 'order_id'
      }
    },
    courier_id: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    vehicle_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'courier_vehicles',
        key: 'vehicle_id'
      }
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['pending', 'accepted', 'in_progress', 'completed', 'failed']],
      },
    },
    start_location: {
      type: DataTypes.GEOGRAPHY('POINT', 4326),
    },
    end_location: {
      type: DataTypes.GEOGRAPHY('POINT', 4326),
    },
    picked_up_at: {
      type: DataTypes.DATE,
    },
    delivered_at: {
      type: DataTypes.DATE,
    },
    current_location: {
      type: DataTypes.GEOGRAPHY('POINT', 4326),
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    earnings: {
      type: DataTypes.DECIMAL(10, 2),
    }
  }, {
    sequelize,
    modelName: 'Delivery',
    tableName: 'deliveries',
    timestamps: false, // We use specific timestamps like picked_up_at and delivered_at
  });

  return Delivery;
};
