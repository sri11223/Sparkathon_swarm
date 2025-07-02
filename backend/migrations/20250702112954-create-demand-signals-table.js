'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('demand_signals', {
      signal_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      source: {
        type: Sequelize.ENUM('social_media', 'weather', 'local_event', 'competitor_pricing', 'internal_promotion'),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      source_identifier: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      geographic_scope: {
        type: Sequelize.GEOGRAPHY('POLYGON', 4326),
        allowNull: true,
      },
      predicted_impact_start: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      predicted_impact_end: {
        type: Sequelize.DATE,
        allowNull: false,
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
    await queryInterface.dropTable('demand_signals');
  }
};