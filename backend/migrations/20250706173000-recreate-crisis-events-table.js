// Migration: Drop and recreate crisis_events with all required columns
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('crisis_events', { force: true }).catch(() => {});
    await queryInterface.createTable('crisis_events', {
      crisis_event_id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      title: { type: Sequelize.STRING, allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      crisis_type: { type: Sequelize.STRING, allowNull: true },
      severity_level: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'monitoring' },
      affected_areas: { type: Sequelize.JSONB, allowNull: false },
      emergency_contacts: { type: Sequelize.JSONB, allowNull: true },
      resource_needs: { type: Sequelize.JSONB, allowNull: true },
      response_plan: { type: Sequelize.TEXT, allowNull: true },
      activation_time: { type: Sequelize.DATE, allowNull: true },
      estimated_duration: { type: Sequelize.STRING },
      created_by: { type: Sequelize.UUID, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('crisis_events');
  }
};
