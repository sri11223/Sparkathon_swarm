// Migration to drop and recreate community_hubs table with all required columns
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS community_hubs CASCADE');
    await queryInterface.createTable('community_hubs', {
      community_hub_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
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
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('community_hubs');
  }
};
