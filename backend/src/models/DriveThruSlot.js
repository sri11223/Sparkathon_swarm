const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class DriveThruSlot extends Model {
    static associate(models) {
      // A drive-thru slot belongs to a hub
      DriveThruSlot.belongsTo(models.Hub, {
        foreignKey: 'hub_id',
        as: 'hub'
      });
      
      // A drive-thru slot belongs to a customer
      DriveThruSlot.belongsTo(models.User, {
        foreignKey: 'customer_id',
        as: 'customer'
      });
      
      // A drive-thru slot belongs to an order
      DriveThruSlot.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
      });
    }
  }

  DriveThruSlot.init({
    slot_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    hub_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'hubs',
        key: 'hub_id'
      }
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'order_id'
      }
    },
    slot_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    slot_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    estimated_duration: {
      type: DataTypes.INTEGER, // in minutes
      defaultValue: 15
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'scheduled',
      validate: {
        isIn: [['scheduled', 'customer_notified', 'customer_arrived', 'in_progress', 'completed', 'cancelled', 'no_show']]
      }
    },
    vehicle_info: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    special_instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    queue_position: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    actual_start_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actual_end_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    customer_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    hub_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'DriveThruSlot',
    tableName: 'drive_thru_slots',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['hub_id', 'slot_date', 'slot_time']
      },
      {
        fields: ['customer_id']
      },
      {
        fields: ['order_id']
      },
      {
        fields: ['status']
      }
    ]
  });

  return DriveThruSlot;
};
