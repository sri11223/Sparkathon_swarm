const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      // A user can own multiple hubs
      User.hasMany(models.Hub, { 
        foreignKey: 'owner_id',
        as: 'hubs' 
      });
      // A user can place multiple orders
      User.hasMany(models.Order, { 
        foreignKey: 'customer_id',
        as: 'orders'
      });
      // A user can be a courier for multiple deliveries
      User.hasMany(models.Delivery, { 
        foreignKey: 'courier_id',
        as: 'deliveries'
      });
      User.hasMany(models.CourierVehicle, {
        foreignKey: 'courier_id',
        as: 'vehicles'
      });
      User.hasMany(models.UserRating, {
        foreignKey: 'rater_user_id',
        as: 'given_ratings'
      });
      User.hasMany(models.UserRating, {
        foreignKey: 'ratee_user_id',
        as: 'received_ratings'
      });
    }
  }

  User.init({
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    middle_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      unique: true,
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['customer', 'hub_owner', 'courier', 'admin']],
      },
    },
    background_check_status: {
      type: DataTypes.ENUM('not_started', 'pending', 'passed', 'failed'),
      allowNull: true,
      defaultValue: 'not_started'
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return User;
};