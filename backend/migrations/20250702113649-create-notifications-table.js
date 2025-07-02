'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      notification_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('order_status', 'new_delivery', 'payout_notification', 'promotional', 'system_alert', 'hub_inventory'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('sent', 'delivered', 'read', 'failed'),
        defaultValue: 'sent',
        allowNull: false,
      },
      related_entity_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      related_entity_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });
    await queryInterface.addIndex('notifications', ['user_id']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notifications');
  }
};