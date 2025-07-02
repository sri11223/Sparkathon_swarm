'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('deliveries', 'vehicle_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'courier_vehicles',
        key: 'vehicle_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('deliveries', 'vehicle_id');
  }
};