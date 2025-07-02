const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class AIRecommendation extends Model {
    static associate(models) {
      // An AI recommendation may be for a hub
      AIRecommendation.belongsTo(models.Hub, {
        foreignKey: 'hub_id',
        as: 'hub'
      });
      // An AI recommendation may be for a product
      AIRecommendation.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
    }
  }

  AIRecommendation.init({
    recommendation_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    hub_id: {
      type: DataTypes.UUID,
      references: {
        model: 'hubs',
        key: 'hub_id'
      }
    },
    product_id: {
      type: DataTypes.UUID,
      references: {
        model: 'products',
        key: 'product_id'
      }
    },
    recommendation_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['restock', 'new_product', 'remove_product', 'price_adjustment', 'demand_forecast']]
      }
    },
    confidence_score: {
      type: DataTypes.DECIMAL(3, 2),
      validate: {
        min: 0,
        max: 1
      }
    },
    recommended_quantity: {
      type: DataTypes.INTEGER
    },
    recommended_price: {
      type: DataTypes.DECIMAL(10, 2)
    },
    reasoning: {
      type: DataTypes.TEXT
    },
    metadata: {
      type: DataTypes.JSONB
    },
    is_applied: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    applied_at: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'AIRecommendation',
    tableName: 'ai_recommendations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return AIRecommendation;
};
