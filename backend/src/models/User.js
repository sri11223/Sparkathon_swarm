const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100]
      }
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        is: /^[\+]?[1-9][\d]{0,15}$/
      }
    },
    user_type: {
      type: DataTypes.ENUM('customer', 'hubowner', 'courier', 'admin'),
      allowNull: false,
      defaultValue: 'customer'
    },
    profile_image_url: {
      type: DataTypes.STRING(500)
    },
    address: {
      type: DataTypes.TEXT
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8)
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8)
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    verification_token: {
      type: DataTypes.STRING
    },
    reset_password_token: {
      type: DataTypes.STRING
    },
    reset_password_expires: {
      type: DataTypes.DATE
    },
    last_login: {
      type: DataTypes.DATE
    },
    // Courier specific fields
    vehicle_type: {
      type: DataTypes.ENUM('bike', 'car', 'van', 'truck'),
      allowNull: true
    },
    license_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    current_lat: {
      type: DataTypes.DECIMAL(10, 8)
    },
    current_lng: {
      type: DataTypes.DECIMAL(11, 8)
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 5.0
    },
    total_deliveries: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password_hash')) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      }
    }
  });

  // Instance methods
  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
  };

  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password_hash;
    delete values.verification_token;
    delete values.reset_password_token;
    delete values.reset_password_expires;
    return values;
  };

  return User;
};
