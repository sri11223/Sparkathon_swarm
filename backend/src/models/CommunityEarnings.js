const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CommunityEarnings extends Model {
    static associate(models) {
      CommunityEarnings.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      CommunityEarnings.belongsTo(models.Hub, {
        foreignKey: 'hub_id',
        as: 'hub'
      });
      CommunityEarnings.belongsTo(models.CommunityHub, {
        foreignKey: 'community_hub_id',
        as: 'communityHub'
      });
      CommunityEarnings.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
      });
    }
  }

  CommunityEarnings.init({
    earnings_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    hub_id: {
      type: DataTypes.UUID,
    },
    community_hub_id: {
      type: DataTypes.UUID,
    },
    order_id: {
      type: DataTypes.UUID,
    },
    earning_type: {
      type: DataTypes.ENUM('delivery_fee', 'hub_commission', 'community_bonus', 'challenge_reward', 'emergency_incentive', 'tip', 'penalty'),
      allowNull: false,
    },
    user_role: {
      type: DataTypes.ENUM('hub_owner', 'courier', 'community_leader', 'volunteer'),
      allowNull: false,
    },
    base_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    bonus_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    penalty_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    final_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    commission_rate: {
      type: DataTypes.DECIMAL(5, 2), // percentage
    },
    performance_multiplier: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 1.0,
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'approved', 'paid', 'disputed', 'cancelled'),
      defaultValue: 'pending',
    },
    payment_method: {
      type: DataTypes.ENUM('bank_transfer', 'digital_wallet', 'cash', 'platform_credit'),
    },
    tax_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    net_amount: {
      type: DataTypes.DECIMAL(10, 2),
    },
    earning_period: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    calculation_details: {
      type: DataTypes.JSONB, // breakdown of calculation
      defaultValue: {},
    },
    performance_metrics: {
      type: DataTypes.JSONB, // metrics that influenced earning
      defaultValue: {},
    },
    paid_at: {
      type: DataTypes.DATE,
    },
    payment_reference: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'CommunityEarnings',
    tableName: 'community_earnings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return CommunityEarnings;
};
