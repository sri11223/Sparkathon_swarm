'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create community_earnings table
    await queryInterface.createTable('community_earnings', {
      earning_id: {
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
      earning_type: {
        type: Sequelize.ENUM('delivery_fee', 'bonus', 'challenge_reward', 'referral_bonus', 'community_points'),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      points_earned: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      source_id: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Reference to order, challenge, etc.'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      payout_status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      payout_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      payment_method: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
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

    // Create safety_reports table
    await queryInterface.createTable('safety_reports', {
      report_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      reporter_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      incident_type: {
        type: Sequelize.ENUM('accident', 'theft', 'harassment', 'unsafe_conditions', 'emergency', 'other'),
        allowNull: false
      },
      severity: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: false
      },
      location: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Coordinates and address details'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      evidence: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Photos, videos, documents'
      },
      involved_parties: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      witness_info: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      status: {
        type: Sequelize.ENUM('reported', 'under_review', 'investigating', 'resolved', 'dismissed'),
        allowNull: false,
        defaultValue: 'reported'
      },
      assigned_to: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      resolution_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      resolved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_anonymous: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

    // Create community_leaderboards table
    await queryInterface.createTable('community_leaderboards', {
      leaderboard_id: {
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
      leaderboard_type: {
        type: Sequelize.ENUM('weekly_deliveries', 'monthly_earnings', 'eco_points', 'community_service', 'customer_ratings'),
        allowNull: false
      },
      period: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'e.g., 2024-W01, 2024-01'
      },
      rank: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      score: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      metrics: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {}
      },
      achievements: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      rewards_earned: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      is_current: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    await queryInterface.addIndex('community_earnings', ['user_id']);
    await queryInterface.addIndex('community_earnings', ['earning_type']);
    await queryInterface.addIndex('community_earnings', ['payout_status']);
    await queryInterface.addIndex('community_earnings', ['created_at']);
    
    await queryInterface.addIndex('safety_reports', ['reporter_id']);
    await queryInterface.addIndex('safety_reports', ['incident_type']);
    await queryInterface.addIndex('safety_reports', ['severity']);
    await queryInterface.addIndex('safety_reports', ['status']);
    await queryInterface.addIndex('safety_reports', ['assigned_to']);
    await queryInterface.addIndex('safety_reports', ['created_at']);
    
    await queryInterface.addIndex('community_leaderboards', ['user_id']);
    await queryInterface.addIndex('community_leaderboards', ['leaderboard_type']);
    await queryInterface.addIndex('community_leaderboards', ['period']);
    await queryInterface.addIndex('community_leaderboards', ['rank']);
    await queryInterface.addIndex('community_leaderboards', ['is_current']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('community_leaderboards');
    await queryInterface.dropTable('safety_reports');
    await queryInterface.dropTable('community_earnings');
  }
};
