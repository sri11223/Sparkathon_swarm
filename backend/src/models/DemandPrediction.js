const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class DemandPrediction extends Model {
    static associate(models) {
      DemandPrediction.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
      DemandPrediction.belongsTo(models.Hub, {
        foreignKey: 'hub_id',
        as: 'hub'
      });
      DemandPrediction.belongsTo(models.DemandSignal, {
        foreignKey: 'signal_id',
        as: 'signal'
      });
    }
  }

  DemandPrediction.init({
    prediction_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    hub_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    signal_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    predicted_demand_increase: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    confidence_score: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    prediction_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    algorithm_version: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'DemandPrediction',
    tableName: 'demand_predictions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return DemandPrediction;
};
