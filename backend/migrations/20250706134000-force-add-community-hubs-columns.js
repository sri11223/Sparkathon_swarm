"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("community_hubs");
    if (!tableInfo.community_name) await queryInterface.addColumn("community_hubs", "community_name", { type: Sequelize.STRING, allowNull: true });
    if (!tableInfo.description) await queryInterface.addColumn("community_hubs", "description", { type: Sequelize.TEXT, allowNull: true });
    if (!tableInfo.category) await queryInterface.addColumn("community_hubs", "category", { type: Sequelize.STRING, allowNull: true });
    if (!tableInfo.location) await queryInterface.addColumn("community_hubs", "location", { type: Sequelize.JSONB, allowNull: true });
    if (!tableInfo.operating_hours) await queryInterface.addColumn("community_hubs", "operating_hours", { type: Sequelize.JSONB, allowNull: true });
    if (!tableInfo.contact_info) await queryInterface.addColumn("community_hubs", "contact_info", { type: Sequelize.JSONB, allowNull: true });
    if (!tableInfo.amenities) await queryInterface.addColumn("community_hubs", "amenities", { type: Sequelize.JSONB, allowNull: true });
    if (!tableInfo.community_features) await queryInterface.addColumn("community_hubs", "community_features", { type: Sequelize.JSONB, allowNull: true });
    if (!tableInfo.safety_rating) await queryInterface.addColumn("community_hubs", "safety_rating", { type: Sequelize.DECIMAL(3,2), allowNull: true });
    if (!tableInfo.hub_owner_id) await queryInterface.addColumn("community_hubs", "hub_owner_id", { type: Sequelize.UUID, allowNull: true });
    if (!tableInfo.status) await queryInterface.addColumn("community_hubs", "status", { type: Sequelize.STRING, allowNull: true });
  },

  down: async (queryInterface, Sequelize) => {
    // Only remove columns if they exist
    const tableInfo = await queryInterface.describeTable("community_hubs");
    if (tableInfo.community_name) await queryInterface.removeColumn("community_hubs", "community_name");
    if (tableInfo.description) await queryInterface.removeColumn("community_hubs", "description");
    if (tableInfo.category) await queryInterface.removeColumn("community_hubs", "category");
    if (tableInfo.location) await queryInterface.removeColumn("community_hubs", "location");
    if (tableInfo.operating_hours) await queryInterface.removeColumn("community_hubs", "operating_hours");
    if (tableInfo.contact_info) await queryInterface.removeColumn("community_hubs", "contact_info");
    if (tableInfo.amenities) await queryInterface.removeColumn("community_hubs", "amenities");
    if (tableInfo.community_features) await queryInterface.removeColumn("community_hubs", "community_features");
    if (tableInfo.safety_rating) await queryInterface.removeColumn("community_hubs", "safety_rating");
    if (tableInfo.hub_owner_id) await queryInterface.removeColumn("community_hubs", "hub_owner_id");
    if (tableInfo.status) await queryInterface.removeColumn("community_hubs", "status");
  }
};
