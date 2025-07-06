'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if community_hubs table exists and modify the community_leader_id constraint
    const tableInfo = await queryInterface.describeTable('community_hubs');
    
    if (tableInfo.community_leader_id) {
      // Modify the community_leader_id column to allow null values
      await queryInterface.changeColumn('community_hubs', 'community_leader_id', {
        type: Sequelize.UUID,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the change - make community_leader_id non-nullable again
    // Note: This might fail if there are null values in the column
    await queryInterface.changeColumn('community_hubs', 'community_leader_id', {
      type: Sequelize.UUID,
      allowNull: false
    });
  }
};
