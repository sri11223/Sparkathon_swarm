'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order_vouchers', {
      order_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'order_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      voucher_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'vouchers',
          key: 'voucher_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      discount_applied: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('order_vouchers');
  }
};