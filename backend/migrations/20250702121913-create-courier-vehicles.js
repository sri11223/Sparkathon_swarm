'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('courier_vehicles', {
      vehicle_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      courier_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      make: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      model: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      license_plate: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      color: {
        type: Sequelize.STRING,
      },
      vehicle_type: {
        type: Sequelize.ENUM('bicycle', 'motorcycle', 'sedan', 'suv', 'van', 'truck'),
        allowNull: false,
      },
      capacity_m3: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      has_refrigeration: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending_approval', 'active', 'inactive'),
        defaultValue: 'pending_approval',
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('courier_vehicles');
  }
};