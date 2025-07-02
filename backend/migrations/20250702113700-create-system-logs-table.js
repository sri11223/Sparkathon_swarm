'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('system_logs', {
      log_id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      actor_id: {
        type: Sequelize.UUID,
        allowNull: true, // System actions might not have a user actor
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      details: {
        type: Sequelize.JSONB, // Use JSONB for flexible, queryable data
        allowNull: true,
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });
    await queryInterface.addIndex('system_logs', ['action']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('system_logs');
  }
};