const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class AnalyticsEvent extends Model {
    static associate(models) {
      AnalyticsEvent.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  AnalyticsEvent.init({
    event_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: DataTypes.UUID,
    session_id: DataTypes.STRING,
    event_type: DataTypes.STRING,
    payload: DataTypes.JSONB,
  }, {
    sequelize,
    modelName: 'AnalyticsEvent',
    tableName: 'analytics_events',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  return AnalyticsEvent;
};
