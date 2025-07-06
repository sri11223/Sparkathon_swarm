'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop the incorrectly named table if it exists
    await queryInterface.dropTable('smart_load_optimizations', { force: true }).catch(() => {});

    // Create the correct table as per the model
    await queryInterface.createTable('smartload_optimizations', {
      optimization_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      optimization_type: {
        type: Sequelize.ENUM('warehouse_layout', 'truck_loading', 'route_optimization', 'inventory_placement', 'picking_route'),
        allowNull: false,
      },
      hub_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      vehicle_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      requested_by: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
        defaultValue: 'pending',
      },
      input_parameters: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      optimization_results: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      efficiency_improvement: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0,
      },
      space_utilization: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      weight_distribution: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      loading_sequence: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      picking_route: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      estimated_time_saved: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      cost_savings: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      ai_confidence_score: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
      },
      processing_duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      implementation_status: {
        type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'rejected'),
        defaultValue: 'pending',
      },
      feedback_rating: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      performance_metrics: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('smartload_optimizations');
  }
};
