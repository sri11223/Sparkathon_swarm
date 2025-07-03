const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Hub extends Model {
    static associate(models) {
      // A hub belongs to one owner (User)
      Hub.belongsTo(models.User, { 
        foreignKey: 'owner_id',
        as: 'owner'
      });
      
      // A hub has many inventory items
      Hub.hasMany(models.Inventory, {
        foreignKey: 'hub_id',
        as: 'inventory'
      });
      
      // A hub can fulfill many orders
      Hub.hasMany(models.Order, {
        foreignKey: 'hub_id',
        as: 'orders'
      });
    }
  }

  Hub.init({
    hub_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    location: {
      type: DataTypes.GEOGRAPHY('POINT', 4326),
      // Sequelize doesn't have a GEOGRAPHY type by default.
      // We rely on PostGIS being enabled. The type is primarily for the DB.
      // In code, we'll handle it as an object: { type: 'Point', coordinates: [lng, lat]}
    },
    capacity_m3: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    current_utilization_m3: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['pending', 'active', 'inactive', 'crisis_mode']],
      },
    },
  }, {
    sequelize,
    modelName: 'Hub',
    tableName: 'hubs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Hub;
};