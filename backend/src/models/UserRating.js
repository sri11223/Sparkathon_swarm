const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserRating extends Model {
    static associate(models) {
      // A rating belongs to one order
      UserRating.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
      });
      // A rating has a rater (user who gives the rating)
      UserRating.belongsTo(models.User, {
        foreignKey: 'rater_id',
        as: 'rater'
      });
      // A rating has a rated user (user who receives the rating)
      UserRating.belongsTo(models.User, {
        foreignKey: 'rated_user_id',
        as: 'ratedUser'
      });
      // A rating may be associated with a hub
      UserRating.belongsTo(models.Hub, {
        foreignKey: 'hub_id',
        as: 'hub'
      });
    }
  }

  UserRating.init({
    rating_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'order_id'
      }
    },
    rater_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    rated_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    hub_id: {
      type: DataTypes.UUID,
      references: {
        model: 'hubs',
        key: 'hub_id'
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    review_text: {
      type: DataTypes.TEXT
    },
    rating_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['customer_to_hub', 'customer_to_courier', 'hub_to_customer', 'courier_to_customer']]
      }
    }
  }, {
    sequelize,
    modelName: 'UserRating',
    tableName: 'user_ratings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return UserRating;
};
