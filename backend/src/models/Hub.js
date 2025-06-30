const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Hub = sequelize.define('Hub', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 255]
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
      validate: {
        min: -90,
        max: 90
      }
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
      validate: {
        min: -180,
        max: 180
      }
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 10000
      }
    },
    current_utilization: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    hourly_rate: {
      type: DataTypes.DECIMAL(10, 2),
      validate: {
        min: 0
      }
    },
    contact_phone: {
      type: DataTypes.STRING(20)
    },
    contact_email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
    operating_hours: {
      type: DataTypes.JSON,
      defaultValue: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '10:00', close: '16:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: true }
      }
    },
    amenities: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending_approval', 'suspended'),
      defaultValue: 'pending_approval'
    },
    verification_documents: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    average_rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 5.0
    },
    total_reviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    total_orders: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    monthly_earnings: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    }
  }, {
    tableName: 'hubs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_hub_location',
        fields: ['latitude', 'longitude']
      },
      {
        name: 'idx_hub_status',
        fields: ['status']
      },
      {
        name: 'idx_hub_owner',
        fields: ['owner_id']
      }
    ]
  });

  // Instance methods
  Hub.prototype.calculateUtilizationPercentage = function() {
    return Math.round((this.current_utilization / this.capacity) * 100);
  };

  Hub.prototype.isOperatingNow = function() {
    const now = new Date();
    const dayName = now.toLocaleLowerCase().slice(0, 3); // mon, tue, etc.
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM
    
    const todayHours = this.operating_hours[dayName];
    if (!todayHours || todayHours.closed) return false;
    
    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  };

  return Hub;
};
