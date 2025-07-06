// Migration: Add missing columns to crisis_events for seed compatibility
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const columns = await queryInterface.describeTable('crisis_events');
    const addCol = async (name, spec) => {
      if (!columns[name]) await queryInterface.addColumn('crisis_events', name, spec);
    };
    await addCol('title', { type: Sequelize.STRING, allowNull: true });
    await addCol('crisis_type', { type: Sequelize.STRING, allowNull: true });
    await addCol('resource_needs', { type: Sequelize.JSONB, allowNull: true });
    await addCol('response_plan', { type: Sequelize.TEXT, allowNull: true });
    await addCol('emergency_contacts', { type: Sequelize.JSONB, allowNull: true });
    await addCol('activation_time', { type: Sequelize.DATE, allowNull: true });
  },
  down: async (queryInterface) => {
    // No-op: do not remove columns to avoid breaking existing data
  }
};
