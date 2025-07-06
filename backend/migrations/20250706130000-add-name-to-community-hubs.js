"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("community_hubs", "name", {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "Optional name for the community hub"
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("community_hubs", "name");
  }
};
