const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserRating extends Model {
    static associate(models) {
      UserRating.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
      UserRating.belongsTo(models.User, { foreignKey: 'rater_user_id', as: 'rater' });
      UserRating.belongsTo(models.User, { foreignKey: 'ratee_user_id', as: 'ratee' });
    }
  }

  UserRating.init({
    rating_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: DataTypes.UUID,
    rater_user_id: DataTypes.UUID,
    ratee_user_id: DataTypes.UUID,
    rating_type: DataTypes.ENUM('customer_to_courier', 'customer_to_hub', 'courier_to_customer'),
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comment: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'UserRating',
    tableName: 'user_ratings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return UserRating;
};
