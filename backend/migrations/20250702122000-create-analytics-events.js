'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('analytics_events', {
      event_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true, // Can be an anonymous user
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      session_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      event_type: {
        type: Sequelize.STRING,
        allowNull: false, // e.g., 'page_view', 'add_to_cart', 'start_checkout'
      },
      payload: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });
    await queryInterface.addIndex('analytics_events', ['event_type']);
    await queryInterface.addIndex('analytics_events', ['user_id']);
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('analytics_events');
  }
};