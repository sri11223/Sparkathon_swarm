// Comprehensive migration: Drop and recreate all tables used in seeding with all required columns, in correct dependency order
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop tables in reverse dependency order
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS community_leaderboards CASCADE');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS safety_reports CASCADE');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS community_earnings CASCADE');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS smartload_optimizations CASCADE');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS push_notification_tokens CASCADE');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS community_challenges CASCADE');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS emergency_hubs CASCADE');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS crisis_events CASCADE');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS community_hubs CASCADE');

    // Create tables in dependency order
    // 1. community_hubs
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

    // 2. crisis_events
    await queryInterface.createTable('crisis_events', {
      crisis_event_id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      event_name: { type: Sequelize.STRING, allowNull: false },
      event_type: { type: Sequelize.STRING, allowNull: false },
      severity_level: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'monitoring' },
      affected_areas: { type: Sequelize.JSONB },
      description: { type: Sequelize.TEXT },
      emergency_supplies_needed: { type: Sequelize.JSONB },
      volunteer_requirements: { type: Sequelize.JSONB },
      coordination_center: { type: Sequelize.JSONB },
      estimated_duration: { type: Sequelize.STRING },
      priority_level: { type: Sequelize.INTEGER },
      created_by: { type: Sequelize.UUID, allowNull: false },
      activated_at: { type: Sequelize.DATE },
      resolved_at: { type: Sequelize.DATE },
      public_information: { type: Sequelize.JSONB },
      response_metrics: { type: Sequelize.JSONB },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // 3. emergency_hubs (depends on crisis_events)
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

    // 4. community_challenges
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

    // 5. push_notification_tokens
    await queryInterface.createTable('push_notification_tokens', {
      token_id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      user_id: { type: Sequelize.UUID, allowNull: false },
      device_token: { type: Sequelize.STRING, allowNull: false },
      device_type: { type: Sequelize.STRING, allowNull: false },
      device_info: { type: Sequelize.JSONB },
      app_version: { type: Sequelize.STRING },
      os_version: { type: Sequelize.STRING },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      notification_preferences: { type: Sequelize.JSONB },
      last_used: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // 6. smartload_optimizations
    await queryInterface.createTable('smartload_optimizations', {
      optimization_id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      hub_id: { type: Sequelize.UUID, allowNull: false },
      optimization_type: { type: Sequelize.STRING },
      input_data: { type: Sequelize.JSONB },
      optimization_results: { type: Sequelize.JSONB },
      efficiency_metrics: { type: Sequelize.JSONB },
      implementation_status: { type: Sequelize.STRING },
      estimated_savings: { type: Sequelize.JSONB },
      requested_by: { type: Sequelize.UUID },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // 7. community_earnings
    await queryInterface.createTable('community_earnings', {
      earning_id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      user_id: { type: Sequelize.UUID, allowNull: false },
      earning_type: { type: Sequelize.STRING },
      amount: { type: Sequelize.FLOAT },
      points_earned: { type: Sequelize.INTEGER },
      source_id: { type: Sequelize.UUID },
      description: { type: Sequelize.TEXT },
      payout_status: { type: Sequelize.STRING },
      payout_date: { type: Sequelize.DATE },
      payment_method: { type: Sequelize.JSONB },
      metadata: { type: Sequelize.JSONB },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // 8. safety_reports
    await queryInterface.createTable('safety_reports', {
      report_id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      reporter_id: { type: Sequelize.UUID, allowNull: false },
      incident_type: { type: Sequelize.STRING },
      severity: { type: Sequelize.STRING },
      location: { type: Sequelize.JSONB },
      description: { type: Sequelize.TEXT },
      evidence: { type: Sequelize.JSONB },
      involved_parties: { type: Sequelize.JSONB },
      witness_info: { type: Sequelize.JSONB },
      status: { type: Sequelize.STRING },
      assigned_to: { type: Sequelize.UUID },
      resolution_notes: { type: Sequelize.TEXT },
      resolved_at: { type: Sequelize.DATE },
      is_anonymous: { type: Sequelize.BOOLEAN },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // 9. community_leaderboards
    await queryInterface.createTable('community_leaderboards', {
      leaderboard_id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      user_id: { type: Sequelize.UUID, allowNull: false },
      leaderboard_type: { type: Sequelize.STRING },
      period: { type: Sequelize.STRING },
      rank: { type: Sequelize.INTEGER },
      score: { type: Sequelize.FLOAT },
      metrics: { type: Sequelize.JSONB },
      achievements: { type: Sequelize.JSONB },
      rewards_earned: { type: Sequelize.JSONB },
      is_current: { type: Sequelize.BOOLEAN },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('community_leaderboards');
    await queryInterface.dropTable('safety_reports');
    await queryInterface.dropTable('community_earnings');
    await queryInterface.dropTable('smartload_optimizations');
    await queryInterface.dropTable('push_notification_tokens');
    await queryInterface.dropTable('community_challenges');
    await queryInterface.dropTable('emergency_hubs');
    await queryInterface.dropTable('crisis_events');
    await queryInterface.dropTable('community_hubs');
  }
};
