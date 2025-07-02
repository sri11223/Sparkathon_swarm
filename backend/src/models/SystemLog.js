const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SystemLog extends Model {
    static associate(models) {
      SystemLog.belongsTo(models.User, {
        foreignKey: 'actor_id',
        as: 'actor'
      });
    }
  }

  SystemLog.init({
    log_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    actor_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'SystemLog',
    tableName: 'system_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // Audit logs are typically immutable
  });

  return SystemLog;
};
