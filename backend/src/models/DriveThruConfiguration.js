const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class DriveThruConfiguration extends Model {
    static associate(models) {
      // Drive-thru configuration belongs to a hub
      DriveThruConfiguration.belongsTo(models.Hub, {
        foreignKey: 'hub_id',
        as: 'hub'
      });
    }
  }

  DriveThruConfiguration.init({
    config_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    hub_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'hubs',
        key: 'hub_id'
      }
    },
    is_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    operating_hours: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        monday: { open: '09:00', close: '18:00', enabled: true },
        tuesday: { open: '09:00', close: '18:00', enabled: true },
        wednesday: { open: '09:00', close: '18:00', enabled: true },
        thursday: { open: '09:00', close: '18:00', enabled: true },
        friday: { open: '09:00', close: '18:00', enabled: true },
        saturday: { open: '10:00', close: '16:00', enabled: true },
        sunday: { open: '10:00', close: '16:00', enabled: false }
      }
    },
    slot_duration: {
      type: DataTypes.INTEGER, // in minutes
      defaultValue: 15
    },
    max_advance_booking_days: {
      type: DataTypes.INTEGER,
      defaultValue: 7
    },
    concurrent_slots: {
      type: DataTypes.INTEGER,
      defaultValue: 2
    },
    buffer_time: {
      type: DataTypes.INTEGER, // in minutes between slots
      defaultValue: 5
    },
    auto_confirm_orders: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    require_vehicle_info: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    special_instructions_max_length: {
      type: DataTypes.INTEGER,
      defaultValue: 500
    },
    notification_settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        customer_booking_confirmation: true,
        customer_order_ready: true,
        customer_arrival_reminder: true,
        hub_new_booking: true,
        hub_customer_arrived: true
      }
    }
  }, {
    sequelize,
    modelName: 'DriveThruConfiguration',
    tableName: 'drive_thru_configurations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return DriveThruConfiguration;
};
