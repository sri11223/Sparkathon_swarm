const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class AnalyticsEvent extends Model {
    static associate(models) {
      // An analytics event may belong to a user
      AnalyticsEvent.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }

  AnalyticsEvent.init({
    event_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    event_type: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    event_category: {
      type: DataTypes.STRING(50)
    },
    event_data: {
      type: DataTypes.JSONB
    },
    ip_address: {
      type: DataTypes.INET
    },
    user_agent: {
      type: DataTypes.TEXT
    },
    session_id: {
      type: DataTypes.STRING(255)
    }
  }, {
    sequelize,
    modelName: 'AnalyticsEvent',
    tableName: 'analytics_events',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return AnalyticsEvent;
};
