'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create community_hubs table
    await queryInterface.createTable('community_hubs', {
      hub_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      category: {
        type: Sequelize.ENUM('local_marketplace', 'emergency_center', 'social_hub', 'skill_sharing'),
        allowNull: false,
        defaultValue: 'local_marketplace'
      },
      location: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Coordinates and address details'
      },
      operating_hours: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {}
      },
      contact_info: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      amenities: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      community_features: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      safety_rating: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
        defaultValue: 0.0
      },
      hub_owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'maintenance'),
        allowNull: false,
        defaultValue: 'active'
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

    // Create crisis_events table
    await queryInterface.createTable('crisis_events', {
      crisis_id: {
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
      crisis_type: {
        type: Sequelize.ENUM('natural_disaster', 'emergency', 'supply_shortage', 'infrastructure_failure', 'health_crisis'),
        allowNull: false
      },
      severity_level: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: false,
        defaultValue: 'medium'
      },
      affected_areas: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      emergency_contacts: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      resource_needs: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      response_plan: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'contained', 'resolved', 'monitoring'),
        allowNull: false,
        defaultValue: 'active'
      },
      activation_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      estimated_duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Duration in hours'
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

    // Create emergency_hubs table
    await queryInterface.createTable('emergency_hubs', {
      emergency_hub_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      crisis_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'crisis_events',
          key: 'crisis_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      emergency_role: {
        type: Sequelize.ENUM('supply_center', 'evacuation_point', 'medical_station', 'communication_hub', 'coordination_center'),
        allowNull: false
      },
      capacity: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {}
      },
      available_resources: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      volunteer_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('operational', 'overwhelmed', 'offline', 'evacuated'),
        allowNull: false,
        defaultValue: 'operational'
      },
      contact_person: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      activation_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
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
    await queryInterface.addIndex('community_hubs', ['hub_owner_id']);
    await queryInterface.addIndex('community_hubs', ['status']);
    await queryInterface.addIndex('crisis_events', ['crisis_type']);
    await queryInterface.addIndex('crisis_events', ['severity_level']);
    await queryInterface.addIndex('crisis_events', ['status']);
    await queryInterface.addIndex('crisis_events', ['created_by']);
    await queryInterface.addIndex('emergency_hubs', ['crisis_id']);
    await queryInterface.addIndex('emergency_hubs', ['hub_id']);
    await queryInterface.addIndex('emergency_hubs', ['emergency_role']);
    await queryInterface.addIndex('emergency_hubs', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('emergency_hubs');
    await queryInterface.dropTable('crisis_events');
    await queryInterface.dropTable('community_hubs');
  }
};
