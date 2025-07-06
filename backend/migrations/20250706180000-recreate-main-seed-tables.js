// Migration to drop and recreate all main tables with all required columns for seeding
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop tables if they exist
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS community_challenges CASCADE');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS community_hubs CASCADE');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS crisis_events CASCADE');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS emergency_hubs CASCADE');

    // Recreate community_hubs
    await queryInterface.createTable('community_hubs', {
      community_hub_id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      hub_id: { type: Sequelize.UUID, allowNull: false },
      community_name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      category: { type: Sequelize.STRING },
      location: { type: Sequelize.JSONB },
      operating_hours: { type: Sequelize.JSONB },
      contact_info: { type: Sequelize.JSONB },
      amenities: { type: Sequelize.JSONB },
      community_features: { type: Sequelize.JSONB },
      safety_rating: { type: Sequelize.FLOAT },
      hub_owner_id: { type: Sequelize.UUID, allowNull: false },
      status: { type: Sequelize.STRING },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // Recreate crisis_events
    await queryInterface.createTable('crisis_events', {
      crisis_event_id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      crisis_type: { type: Sequelize.STRING, allowNull: false },
      severity_level: { type: Sequelize.STRING, allowNull: false },
      affected_areas: { type: Sequelize.JSONB },
      emergency_contacts: { type: Sequelize.JSONB },
      resource_needs: { type: Sequelize.JSONB },
      response_plan: { type: Sequelize.TEXT },
      status: { type: Sequelize.STRING, allowNull: false },
      activation_time: { type: Sequelize.DATE },
      estimated_duration: { type: Sequelize.INTEGER },
      created_by: { type: Sequelize.UUID, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // Recreate emergency_hubs
    await queryInterface.createTable('emergency_hubs', {
      emergency_hub_id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      crisis_event_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'crisis_events', key: 'crisis_event_id' }, onDelete: 'CASCADE' },
      hub_id: { type: Sequelize.UUID, allowNull: false },
      emergency_role: { type: Sequelize.STRING },
      capacity: { type: Sequelize.JSONB },
      available_resources: { type: Sequelize.JSONB },
      volunteer_count: { type: Sequelize.INTEGER },
      status: { type: Sequelize.STRING },
      contact_person: { type: Sequelize.UUID },
      activation_time: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // Recreate community_challenges
    await queryInterface.createTable('community_challenges', {
      challenge_id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      challenge_type: { type: Sequelize.STRING, allowNull: false },
      reward_points: { type: Sequelize.INTEGER },
      monetary_reward: { type: Sequelize.FLOAT },
      requirements: { type: Sequelize.JSONB },
      start_date: { type: Sequelize.DATE },
      end_date: { type: Sequelize.DATE },
      participant_count: { type: Sequelize.INTEGER },
      max_participants: { type: Sequelize.INTEGER },
      status: { type: Sequelize.STRING },
      created_by: { type: Sequelize.UUID, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('community_challenges');
    await queryInterface.dropTable('emergency_hubs');
    await queryInterface.dropTable('crisis_events');
    await queryInterface.dropTable('community_hubs');
  }
};
