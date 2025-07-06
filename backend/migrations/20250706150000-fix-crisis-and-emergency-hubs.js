// Migration: Add or fix crisis_events and emergency_hubs tables to match models and seed script
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // --- CRISIS EVENTS ---
    // Add missing columns if not present, or create table if missing
    const tableCrisis = await queryInterface.sequelize.query(
      `SELECT to_regclass('public.crisis_events') as exists;`
    );
    if (!tableCrisis[0][0].exists) {
      await queryInterface.createTable('crisis_events', {
        crisis_event_id: {
          type: Sequelize.UUID,
          primaryKey: true,
          allowNull: false,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
        },
        event_name: { type: Sequelize.STRING, allowNull: false },
        event_type: { type: Sequelize.STRING, allowNull: false },
        severity_level: { type: Sequelize.STRING, allowNull: false },
        status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'monitoring' },
        affected_areas: { type: Sequelize.JSONB, allowNull: false },
        description: { type: Sequelize.TEXT },
        emergency_supplies_needed: { type: Sequelize.JSONB, defaultValue: [] },
        volunteer_requirements: { type: Sequelize.JSONB, defaultValue: {} },
        coordination_center: { type: Sequelize.JSONB },
        estimated_duration: { type: Sequelize.STRING },
        priority_level: { type: Sequelize.INTEGER, defaultValue: 1 },
        created_by: { type: Sequelize.UUID, allowNull: false },
        activated_at: { type: Sequelize.DATE },
        resolved_at: { type: Sequelize.DATE },
        public_information: { type: Sequelize.JSONB, defaultValue: {} },
        response_metrics: { type: Sequelize.JSONB, defaultValue: {} },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      });
    } else {
      // Add missing columns if not present
      const columns = await queryInterface.describeTable('crisis_events');
      const addCol = async (name, spec) => {
        if (!columns[name]) await queryInterface.addColumn('crisis_events', name, spec);
      };
      await addCol('crisis_event_id', { type: Sequelize.UUID, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true });
      await addCol('event_name', { type: Sequelize.STRING, allowNull: false });
      await addCol('event_type', { type: Sequelize.STRING, allowNull: false });
      await addCol('severity_level', { type: Sequelize.STRING, allowNull: false });
      await addCol('status', { type: Sequelize.STRING, allowNull: false, defaultValue: 'monitoring' });
      await addCol('affected_areas', { type: Sequelize.JSONB, allowNull: false });
      await addCol('description', { type: Sequelize.TEXT });
      await addCol('emergency_supplies_needed', { type: Sequelize.JSONB, defaultValue: [] });
      await addCol('volunteer_requirements', { type: Sequelize.JSONB, defaultValue: {} });
      await addCol('coordination_center', { type: Sequelize.JSONB });
      await addCol('estimated_duration', { type: Sequelize.STRING });
      await addCol('priority_level', { type: Sequelize.INTEGER, defaultValue: 1 });
      await addCol('created_by', { type: Sequelize.UUID, allowNull: false });
      await addCol('activated_at', { type: Sequelize.DATE });
      await addCol('resolved_at', { type: Sequelize.DATE });
      await addCol('public_information', { type: Sequelize.JSONB, defaultValue: {} });
      await addCol('response_metrics', { type: Sequelize.JSONB, defaultValue: {} });
      await addCol('created_at', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') });
      await addCol('updated_at', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') });
    }

    // --- EMERGENCY HUBS ---
    const tableEmergency = await queryInterface.sequelize.query(
      `SELECT to_regclass('public.emergency_hubs') as exists;`
    );
    if (!tableEmergency[0][0].exists) {
      await queryInterface.createTable('emergency_hubs', {
        emergency_hub_id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
        hub_id: { type: Sequelize.UUID, allowNull: false },
        crisis_event_id: { type: Sequelize.UUID, allowNull: false },
        volunteer_coordinator_id: { type: Sequelize.UUID },
        emergency_status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'preparing' },
        capacity_emergency: { type: Sequelize.DECIMAL(10,2), defaultValue: 0 },
        volunteer_count: { type: Sequelize.INTEGER, defaultValue: 0 },
        supplies_available: { type: Sequelize.JSONB, defaultValue: {} },
        services_offered: { type: Sequelize.JSONB, defaultValue: [] },
        coordination_details: { type: Sequelize.JSONB, defaultValue: {} },
        emergency_contacts: { type: Sequelize.JSONB, defaultValue: {} },
        operating_schedule: { type: Sequelize.JSONB, defaultValue: {} },
        resource_requests: { type: Sequelize.JSONB, defaultValue: [] },
        people_served: { type: Sequelize.INTEGER, defaultValue: 0 },
        activation_priority: { type: Sequelize.INTEGER, defaultValue: 1 },
        activation_date: { type: Sequelize.DATE },
        deactivation_date: { type: Sequelize.DATE },
        performance_metrics: { type: Sequelize.JSONB, defaultValue: {} },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      });
    } else {
      const columns = await queryInterface.describeTable('emergency_hubs');
      const addCol = async (name, spec) => {
        if (!columns[name]) await queryInterface.addColumn('emergency_hubs', name, spec);
      };
      await addCol('emergency_hub_id', { type: Sequelize.UUID, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true });
      await addCol('hub_id', { type: Sequelize.UUID, allowNull: false });
      await addCol('crisis_event_id', { type: Sequelize.UUID, allowNull: false });
      await addCol('volunteer_coordinator_id', { type: Sequelize.UUID });
      await addCol('emergency_status', { type: Sequelize.STRING, allowNull: false, defaultValue: 'preparing' });
      await addCol('capacity_emergency', { type: Sequelize.DECIMAL(10,2), defaultValue: 0 });
      await addCol('volunteer_count', { type: Sequelize.INTEGER, defaultValue: 0 });
      await addCol('supplies_available', { type: Sequelize.JSONB, defaultValue: {} });
      await addCol('services_offered', { type: Sequelize.JSONB, defaultValue: [] });
      await addCol('coordination_details', { type: Sequelize.JSONB, defaultValue: {} });
      await addCol('emergency_contacts', { type: Sequelize.JSONB, defaultValue: {} });
      await addCol('operating_schedule', { type: Sequelize.JSONB, defaultValue: {} });
      await addCol('resource_requests', { type: Sequelize.JSONB, defaultValue: [] });
      await addCol('people_served', { type: Sequelize.INTEGER, defaultValue: 0 });
      await addCol('activation_priority', { type: Sequelize.INTEGER, defaultValue: 1 });
      await addCol('activation_date', { type: Sequelize.DATE });
      await addCol('deactivation_date', { type: Sequelize.DATE });
      await addCol('performance_metrics', { type: Sequelize.JSONB, defaultValue: {} });
      await addCol('created_at', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') });
      await addCol('updated_at', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('crisis_events');
    await queryInterface.dropTable('emergency_hubs');
  }
};
