'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create drive_thru_configurations table
    await queryInterface.createTable('drive_thru_configurations', {
      config_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      hub_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'hubs',
          key: 'hub_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      is_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      operating_hours: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {
          monday: { open: '09:00', close: '18:00', enabled: true },
          tuesday: { open: '09:00', close: '18:00', enabled: true },
          wednesday: { open: '09:00', close: '18:00', enabled: true },
          thursday: { open: '09:00', close: '18:00', enabled: true },
          friday: { open: '09:00', close: '18:00', enabled: true },
          saturday: { open: '10:00', close: '16:00', enabled: true },
          sunday: { open: '10:00', close: '16:00', enabled: false }
        }
      },
      slot_duration: {
        type: Sequelize.INTEGER,
        defaultValue: 15
      },
      max_advance_booking_days: {
        type: Sequelize.INTEGER,
        defaultValue: 7
      },
      concurrent_slots: {
        type: Sequelize.INTEGER,
        defaultValue: 2
      },
      buffer_time: {
        type: Sequelize.INTEGER,
        defaultValue: 5
      },
      auto_confirm_orders: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      require_vehicle_info: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      special_instructions_max_length: {
        type: Sequelize.INTEGER,
        defaultValue: 500
      },
      notification_settings: {
        type: Sequelize.JSONB,
        defaultValue: {
          customer_booking_confirmation: true,
          customer_order_ready: true,
          customer_arrival_reminder: true,
          hub_new_booking: true,
          hub_customer_arrived: true
        }
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

    // Create drive_thru_slots table
    await queryInterface.createTable('drive_thru_slots', {
      slot_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
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
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'order_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      slot_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      slot_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      estimated_duration: {
        type: Sequelize.INTEGER,
        defaultValue: 15
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'scheduled'
      },
      vehicle_info: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      special_instructions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      queue_position: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      actual_start_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      actual_end_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      customer_rating: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      hub_rating: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      feedback: {
        type: Sequelize.TEXT,
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

    // Add indexes for better performance
    await queryInterface.addIndex('drive_thru_slots', ['hub_id', 'slot_date', 'slot_time']);
    await queryInterface.addIndex('drive_thru_slots', ['customer_id']);
    await queryInterface.addIndex('drive_thru_slots', ['order_id']);
    await queryInterface.addIndex('drive_thru_slots', ['status']);

    // Add check constraints
    await queryInterface.addConstraint('drive_thru_slots', {
      fields: ['status'],
      type: 'check',
      where: {
        status: {
          [Sequelize.Op.in]: ['scheduled', 'customer_notified', 'customer_arrived', 'in_progress', 'completed', 'cancelled', 'no_show']
        }
      }
    });

    await queryInterface.addConstraint('drive_thru_slots', {
      fields: ['customer_rating'],
      type: 'check',
      where: {
        customer_rating: {
          [Sequelize.Op.between]: [1, 5]
        }
      }
    });

    await queryInterface.addConstraint('drive_thru_slots', {
      fields: ['hub_rating'],
      type: 'check',
      where: {
        hub_rating: {
          [Sequelize.Op.between]: [1, 5]
        }
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('drive_thru_slots');
    await queryInterface.dropTable('drive_thru_configurations');
  }
};
