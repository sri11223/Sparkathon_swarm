'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create community_challenges table
    await queryInterface.createTable('community_challenges', {
      challenge_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      challenge_type: {
        type: Sequelize.ENUM('delivery_efficiency', 'sustainability', 'community_service', 'innovation'),
        allowNull: false
      },
      reward_points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      monetary_reward: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      requirements: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {}
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      participant_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      max_participants: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'active', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft'
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create push_notification_tokens table
    await queryInterface.createTable('push_notification_tokens', {
      token_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      device_token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      device_type: {
        type: Sequelize.ENUM('ios', 'android', 'web'),
        allowNull: false
      },
      device_info: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      app_version: {
        type: Sequelize.STRING,
        allowNull: true
      },
      os_version: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      notification_preferences: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {
          order_notifications: true,
          delivery_notifications: true,
          promotional_notifications: true,
          system_notifications: true,
          emergency_notifications: true,
          community_notifications: true,
          earnings_notifications: true
        }
      },
      last_used: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create smart_load_optimizations table
    await queryInterface.createTable('smart_load_optimizations', {
      optimization_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      hub_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'hubs',
          key: 'hub_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      optimization_type: {
        type: Sequelize.ENUM('warehouse_layout', 'truck_loading', 'inventory_placement', 'demand_forecast'),
        allowNull: false
      },
      input_data: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {}
      },
      optimization_results: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      efficiency_metrics: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      implementation_status: {
        type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      estimated_savings: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      requested_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('community_challenges', ['challenge_type']);
    await queryInterface.addIndex('community_challenges', ['status']);
    await queryInterface.addIndex('community_challenges', ['start_date']);
    await queryInterface.addIndex('community_challenges', ['end_date']);
    await queryInterface.addIndex('community_challenges', ['created_by']);
    
    await queryInterface.addIndex('push_notification_tokens', ['user_id']);
    await queryInterface.addIndex('push_notification_tokens', ['device_type']);
    await queryInterface.addIndex('push_notification_tokens', ['is_active']);
    
    await queryInterface.addIndex('smart_load_optimizations', ['hub_id']);
    await queryInterface.addIndex('smart_load_optimizations', ['optimization_type']);
    await queryInterface.addIndex('smart_load_optimizations', ['implementation_status']);
    await queryInterface.addIndex('smart_load_optimizations', ['requested_by']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('smart_load_optimizations');
    await queryInterface.dropTable('push_notification_tokens');
    await queryInterface.dropTable('community_challenges');
  }
};
