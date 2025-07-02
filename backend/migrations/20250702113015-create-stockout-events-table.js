'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stockout_events', {
      stockout_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      hub_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'hubs',
          key: 'hub_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'product_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      stockout_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      restock_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      potential_lost_sales_units: {
        type: Sequelize.INTEGER,
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('stockout_events');
  }
};