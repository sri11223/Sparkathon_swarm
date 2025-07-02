const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SupportTicket extends Model {
    static associate(models) {
      // A support ticket belongs to one user
      SupportTicket.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      // A support ticket may be related to an order
      SupportTicket.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
      });
      // A support ticket may be assigned to a user (admin/support)
      SupportTicket.belongsTo(models.User, {
        foreignKey: 'assigned_to',
        as: 'assignedUser'
      });
    }
  }

  SupportTicket.init({
    ticket_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    order_id: {
      type: DataTypes.UUID,
      references: {
        model: 'orders',
        key: 'order_id'
      }
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(50),
      validate: {
        isIn: [['order_issue', 'payment_problem', 'technical_support', 'account_help', 'feature_request', 'other']]
      }
    },
    priority: {
      type: DataTypes.STRING(20),
      defaultValue: 'medium',
      validate: {
        isIn: [['low', 'medium', 'high', 'urgent']]
      }
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'open',
      validate: {
        isIn: [['open', 'in_progress', 'waiting_for_user', 'resolved', 'closed']]
      }
    },
    assigned_to: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    resolved_at: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'SupportTicket',
    tableName: 'support_tickets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return SupportTicket;
};
