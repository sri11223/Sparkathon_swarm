const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class DemandSignal extends Model {
    static associate(models) {
      DemandSignal.hasMany(models.DemandPrediction, {
        foreignKey: 'signal_id',
        as: 'predictions'
      });
    }
  }

  DemandSignal.init({
    signal_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    source: {
      type: DataTypes.ENUM('social_media', 'weather', 'local_event', 'competitor_pricing', 'internal_promotion'),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    source_identifier: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    geographic_scope: {
      type: DataTypes.GEOGRAPHY('POLYGON', 4326),
      allowNull: true,
    },
    predicted_impact_start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    predicted_impact_end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'DemandSignal',
    tableName: 'demand_signals',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return DemandSignal;
};
