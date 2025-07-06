// Migration: Force add all columns required by the seed script to community_hubs
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const columns = await queryInterface.describeTable('community_hubs');
    const addCol = async (name, spec) => {
      if (!columns[name]) await queryInterface.addColumn('community_hubs', name, spec);
    };
    await addCol('description', { type: Sequelize.TEXT, allowNull: true });
    await addCol('category', { type: Sequelize.STRING, allowNull: true });
    await addCol('location', { type: Sequelize.JSONB, allowNull: true });
    await addCol('operating_hours', { type: Sequelize.JSONB, allowNull: true });
    await addCol('contact_info', { type: Sequelize.JSONB, allowNull: true });
    await addCol('amenities', { type: Sequelize.JSONB, allowNull: true });
    await addCol('community_features', { type: Sequelize.JSONB, allowNull: true });
    await addCol('safety_rating', { type: Sequelize.DECIMAL(3,2), allowNull: true });
    await addCol('hub_owner_id', { type: Sequelize.UUID, allowNull: true });
    await addCol('status', { type: Sequelize.STRING, allowNull: true });
    await addCol('community_name', { type: Sequelize.STRING, allowNull: true });
  },
  down: async (queryInterface) => {
    // No-op: do not remove columns to avoid breaking existing data
  }
};
