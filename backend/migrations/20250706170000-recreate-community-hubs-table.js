// Migration: Drop and recreate community_hubs with all required columns
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('community_hubs', { force: true }).catch(() => {});
    await queryInterface.createTable('community_hubs', {
      community_hub_id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      hub_id: { type: Sequelize.UUID, allowNull: false },
      community_leader_id: { type: Sequelize.UUID, allowNull: true },
      community_name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      category: { type: Sequelize.STRING, allowNull: true },
      location: { type: Sequelize.JSONB, allowNull: true },
      operating_hours: { type: Sequelize.JSONB, allowNull: true },
      contact_info: { type: Sequelize.JSONB, allowNull: true },
      amenities: { type: Sequelize.JSONB, allowNull: true },
      community_features: { type: Sequelize.JSONB, allowNull: true },
      safety_rating: { type: Sequelize.DECIMAL(3,2), allowNull: true },
      hub_owner_id: { type: Sequelize.UUID, allowNull: true },
      status: { type: Sequelize.STRING, allowNull: true },
      registration_status: { type: Sequelize.STRING, allowNull: true },
      community_type: { type: Sequelize.STRING, allowNull: true },
      volunteer_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      total_orders_served: { type: Sequelize.INTEGER, defaultValue: 0 },
      community_rating: { type: Sequelize.DECIMAL(3,2), defaultValue: 0.00 },
      special_services: { type: Sequelize.JSONB, defaultValue: {} },
      community_benefits: { type: Sequelize.JSONB, defaultValue: {} },
      verification_documents: { type: Sequelize.JSONB, defaultValue: {} },
      approved_at: { type: Sequelize.DATE },
      approved_by: { type: Sequelize.UUID },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('community_hubs');
  }
};
