const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CourierVehicle = sequelize.define('CourierVehicle', {
    vehicle_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    courier_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    vehicle_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['bicycle', 'motorcycle', 'car', 'van', 'truck']]
      }
    },
    make: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    model: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1900,
        max: new Date().getFullYear() + 2
      }
    },
    license_plate: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    color: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    capacity_kg: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    capacity_cubic_meters: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    insurance_number: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    insurance_expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'courier_vehicles',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        name: 'idx_courier_vehicles_courier_id',
        fields: ['courier_id']
      },
      {
        name: 'idx_courier_vehicles_type',
        fields: ['vehicle_type']
      },
      {
        name: 'idx_courier_vehicles_active',
        fields: ['is_active']
      }
    ]
  });

  // Instance methods
  CourierVehicle.prototype.isInsuranceValid = function() {
    if (!this.insurance_expires_at) return false;
    return new Date(this.insurance_expires_at) > new Date();
  };

  CourierVehicle.prototype.isInsuranceExpiringSoon = function(daysThreshold = 30) {
    if (!this.insurance_expires_at) return false;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
    return new Date(this.insurance_expires_at) <= thresholdDate;
  };

  CourierVehicle.prototype.getCapacityUtilization = function(currentWeight, currentVolume) {
    const weightUtil = this.capacity_kg ? (currentWeight / this.capacity_kg) * 100 : 0;
    const volumeUtil = this.capacity_cubic_meters ? (currentVolume / this.capacity_cubic_meters) * 100 : 0;
    
    return {
      weight_utilization: Math.min(weightUtil, 100),
      volume_utilization: Math.min(volumeUtil, 100),
      overall_utilization: Math.max(weightUtil, volumeUtil)
    };
  };

  CourierVehicle.prototype.canCarryLoad = function(weight, volume) {
    const weightOk = !this.capacity_kg || weight <= this.capacity_kg;
    const volumeOk = !this.capacity_cubic_meters || volume <= this.capacity_cubic_meters;
    return weightOk && volumeOk;
  };

  CourierVehicle.prototype.getVehicleInfo = function() {
    const parts = [this.year, this.make, this.model].filter(part => part);
    return parts.length > 0 ? parts.join(' ') : this.vehicle_type;
  };

  CourierVehicle.prototype.getDeliveryRadius = function() {
    // Estimated delivery radius based on vehicle type (in km)
    const radiusMap = {
      'bicycle': 5,
      'motorcycle': 15,
      'car': 25,
      'van': 30,
      'truck': 50
    };
    return radiusMap[this.vehicle_type] || 10;
  };

  CourierVehicle.prototype.getBaseDeliveryRate = function() {
    // Base delivery rate per km based on vehicle type
    const rateMap = {
      'bicycle': 2.0,
      'motorcycle': 2.5,
      'car': 3.0,
      'van': 4.0,
      'truck': 5.0
    };
    return rateMap[this.vehicle_type] || 3.0;
  };

  CourierVehicle.prototype.isEcoFriendly = function() {
    return ['bicycle'].includes(this.vehicle_type);
  };

  // Static methods
  CourierVehicle.getVehiclesByType = async function(vehicleType) {
    return await this.findAll({
      where: {
        vehicle_type: vehicleType,
        is_active: true
      },
      include: [{
        model: sequelize.models.User,
        as: 'courier',
        attributes: ['user_id', 'first_name', 'last_name', 'is_available']
      }]
    });
  };

  CourierVehicle.getAvailableVehiclesInArea = async function(latitude, longitude, radiusKm = 10) {
    // This would require geospatial queries - simplified for now
    return await this.findAll({
      where: {
        is_active: true
      },
      include: [{
        model: sequelize.models.User,
        as: 'courier',
        where: {
          is_available: true,
          user_type: 'courier'
        },
        attributes: ['user_id', 'first_name', 'last_name', 'current_latitude', 'current_longitude']
      }]
    });
  };

  CourierVehicle.getVehiclesWithExpiringInsurance = async function(daysThreshold = 30) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return await this.findAll({
      where: {
        insurance_expires_at: {
          [sequelize.Sequelize.Op.lte]: thresholdDate,
          [sequelize.Sequelize.Op.gte]: new Date()
        },
        is_active: true
      },
      include: [{
        model: sequelize.models.User,
        as: 'courier',
        attributes: ['user_id', 'first_name', 'last_name', 'email', 'phone_number']
      }]
    });
  };

  return CourierVehicle;
};
