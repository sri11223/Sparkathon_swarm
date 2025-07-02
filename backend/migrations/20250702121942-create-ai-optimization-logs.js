'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ai_optimization_logs', {
      log_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      optimization_type: {
        type: Sequelize.ENUM('warehouse_picking', 'truck_loading', 'delivery_routing', 'hub_stocking'),
        allowNull: false,
      },
      inputs: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      outputs: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      performance_metrics: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      duration_ms: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      algorithm_version: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('ai_optimization_logs');
  }
};