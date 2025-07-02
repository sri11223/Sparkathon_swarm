'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('demand_predictions', {
      prediction_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
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
      hub_id: {
        type: Sequelize.UUID,
        allowNull: true, // Can be for a region, not a specific hub
        references: {
          model: 'hubs',
          key: 'hub_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      signal_id: {
        type: Sequelize.UUID,
        allowNull: true, // Prediction might be based on general history
        references: {
          model: 'demand_signals',
          key: 'signal_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      predicted_demand_increase: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      confidence_score: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      prediction_datetime: {
        type: Sequelize.DATE,
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
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('demand_predictions');
  }
};