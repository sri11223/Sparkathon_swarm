const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CourierVehicle extends Model {
    static associate(models) {
      CourierVehicle.belongsTo(models.User, {
        foreignKey: 'courier_id',
        as: 'courier'
      });
      CourierVehicle.hasMany(models.Delivery, {
        foreignKey: 'vehicle_id',
        as: 'deliveries'
      });
    }
  }

  CourierVehicle.init({
    vehicle_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    courier_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    make: DataTypes.STRING,
    model: DataTypes.STRING,
    year: DataTypes.INTEGER,
    license_plate: {
      type: DataTypes.STRING,
      unique: true,
    },
    color: DataTypes.STRING,
    vehicle_type: DataTypes.ENUM('bicycle', 'motorcycle', 'sedan', 'suv', 'van', 'truck'),
    capacity_m3: DataTypes.DECIMAL(10, 2),
    has_refrigeration: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('pending_approval', 'active', 'inactive'),
      defaultValue: 'pending_approval',
    },
  }, {
    sequelize,
    modelName: 'CourierVehicle',
    tableName: 'courier_vehicles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return CourierVehicle;
};
