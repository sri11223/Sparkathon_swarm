const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

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

    // Instance method to validate password
    async validatePassword(password) {
      return await bcrypt.compare(password, this.password_hash);
    }

    // Override toJSON to exclude sensitive fields
    toJSON() {
      const user = { ...this.get() };
      delete user.password_hash;
      delete user.email_verification_token;
      return user;
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
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    is_email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    email_verification_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email_verification_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otp_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          const salt = await bcrypt.genSalt(10);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password_hash')) {
          const salt = await bcrypt.genSalt(10);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      }
    }
  });

  return User;
};