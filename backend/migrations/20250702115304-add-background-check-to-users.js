'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'background_check_status', {
      type: Sequelize.ENUM('not_started', 'pending', 'passed', 'failed'),
      allowNull: true,
      defaultValue: 'not_started'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'background_check_status');
  }
};