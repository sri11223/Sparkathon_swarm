const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AIOptimizationLog = sequelize.define('AIOptimizationLog', {
    log_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    optimization_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['route', 'inventory', 'warehouse', 'truck_loading', 'demand_prediction', 'hub_placement']]
      }
    },
    input_data: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    output_data: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    execution_time_ms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    efficiency_improvement: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: -100,
        max: 1000
      }
    },
    cost_savings: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    algorithm_version: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['success', 'failed', 'partial', 'timeout']]
      }
    },
    error_details: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'ai_optimization_logs',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        name: 'idx_ai_optimization_logs_type',
        fields: ['optimization_type']
      },
      {
        name: 'idx_ai_optimization_logs_created_at',
        fields: ['created_at']
      },
      {
        name: 'idx_ai_optimization_logs_status',
        fields: ['status']
      },
      {
        name: 'idx_ai_optimization_logs_algorithm',
        fields: ['algorithm_version']
      }
    ]
  });

  // Instance methods
  AIOptimizationLog.prototype.isSuccessful = function() {
    return this.status === 'success';
  };

  AIOptimizationLog.prototype.hasFailed = function() {
    return this.status === 'failed';
  };

  AIOptimizationLog.prototype.getExecutionTimeSeconds = function() {
    return this.execution_time_ms / 1000;
  };

  AIOptimizationLog.prototype.getPerformanceLevel = function() {
    if (this.execution_time_ms < 1000) return 'excellent';
    if (this.execution_time_ms < 5000) return 'good';
    if (this.execution_time_ms < 15000) return 'acceptable';
    return 'slow';
  };

  AIOptimizationLog.prototype.getImprovementCategory = function() {
    if (!this.efficiency_improvement) return 'no_data';
    if (this.efficiency_improvement >= 50) return 'excellent';
    if (this.efficiency_improvement >= 25) return 'good';
    if (this.efficiency_improvement >= 10) return 'moderate';
    if (this.efficiency_improvement > 0) return 'minimal';
    return 'no_improvement';
  };

  AIOptimizationLog.prototype.getInputSummary = function() {
    try {
      const input = this.input_data;
      switch (this.optimization_type) {
        case 'route':
          return `${input.stops?.length || 0} stops, ${input.vehicles?.length || 0} vehicles`;
        case 'inventory':
          return `${input.products?.length || 0} products, ${input.hubs?.length || 0} hubs`;
        case 'warehouse':
          return `${input.orders?.length || 0} orders, ${input.zones?.length || 0} zones`;
        case 'truck_loading':
          return `${input.items?.length || 0} items, ${input.truck_capacity || 'unknown'} capacity`;
        default:
          return 'Complex optimization data';
      }
    } catch (error) {
      return 'Invalid input data';
    }
  };

  AIOptimizationLog.prototype.getOutputSummary = function() {
    try {
      const output = this.output_data;
      switch (this.optimization_type) {
        case 'route':
          return `${output.routes?.length || 0} routes, ${output.total_distance || 0}km`;
        case 'inventory':
          return `${output.recommendations?.length || 0} recommendations`;
        case 'warehouse':
          return `${output.picking_routes?.length || 0} picking routes`;
        case 'truck_loading':
          return `${output.load_plans?.length || 0} load plans, ${output.utilization || 0}% utilization`;
        default:
          return 'Optimization results available';
      }
    } catch (error) {
      return 'Invalid output data';
    }
  };

  // Static methods
  AIOptimizationLog.getPerformanceStats = async function(optimizationType = null, timeframe = 'week') {
    let whereClause = {};
    
    if (optimizationType) {
      whereClause.optimization_type = optimizationType;
    }
    
    // Add timeframe filter
    const now = new Date();
    let startDate;
    switch (timeframe) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    whereClause.created_at = {
      [sequelize.Sequelize.Op.gte]: startDate
    };

    const stats = await this.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('log_id')), 'total_optimizations'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'success' THEN 1 END")), 'successful_optimizations'],
        [sequelize.fn('AVG', sequelize.col('execution_time_ms')), 'avg_execution_time'],
        [sequelize.fn('AVG', sequelize.col('efficiency_improvement')), 'avg_efficiency_improvement'],
        [sequelize.fn('SUM', sequelize.col('cost_savings')), 'total_cost_savings']
      ],
      raw: true
    });

    return stats[0] || {
      total_optimizations: 0,
      successful_optimizations: 0,
      avg_execution_time: 0,
      avg_efficiency_improvement: 0,
      total_cost_savings: 0
    };
  };

  AIOptimizationLog.getOptimizationTrends = async function(optimizationType, days = 30) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    return await this.findAll({
      where: {
        optimization_type: optimizationType,
        created_at: {
          [sequelize.Sequelize.Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('log_id')), 'count'],
        [sequelize.fn('AVG', sequelize.col('execution_time_ms')), 'avg_execution_time'],
        [sequelize.fn('AVG', sequelize.col('efficiency_improvement')), 'avg_improvement']
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
      raw: true
    });
  };

  AIOptimizationLog.getFailureAnalysis = async function(timeframe = 'week') {
    const now = new Date();
    const startDate = new Date(now.getTime() - (timeframe === 'week' ? 7 : 30) * 24 * 60 * 60 * 1000);

    return await this.findAll({
      where: {
        status: {
          [sequelize.Sequelize.Op.in]: ['failed', 'timeout']
        },
        created_at: {
          [sequelize.Sequelize.Op.gte]: startDate
        }
      },
      attributes: [
        'optimization_type',
        'status',
        [sequelize.fn('COUNT', sequelize.col('log_id')), 'failure_count'],
        [sequelize.fn('AVG', sequelize.col('execution_time_ms')), 'avg_execution_time']
      ],
      group: ['optimization_type', 'status'],
      order: [['optimization_type', 'ASC']],
      raw: true
    });
  };

  AIOptimizationLog.getTopOptimizations = async function(optimizationType, limit = 10) {
    return await this.findAll({
      where: {
        optimization_type: optimizationType,
        status: 'success',
        efficiency_improvement: {
          [sequelize.Sequelize.Op.gt]: 0
        }
      },
      order: [['efficiency_improvement', 'DESC']],
      limit,
      attributes: [
        'log_id', 'efficiency_improvement', 'cost_savings', 
        'execution_time_ms', 'algorithm_version', 'created_at'
      ]
    });
  };

  AIOptimizationLog.getAlgorithmComparison = async function(optimizationType) {
    return await this.findAll({
      where: {
        optimization_type: optimizationType,
        status: 'success'
      },
      attributes: [
        'algorithm_version',
        [sequelize.fn('COUNT', sequelize.col('log_id')), 'usage_count'],
        [sequelize.fn('AVG', sequelize.col('execution_time_ms')), 'avg_execution_time'],
        [sequelize.fn('AVG', sequelize.col('efficiency_improvement')), 'avg_improvement']
      ],
      group: ['algorithm_version'],
      order: [['avg_improvement', 'DESC']],
      raw: true
    });
  };

  AIOptimizationLog.logOptimization = async function(data) {
    return await this.create({
      optimization_type: data.optimization_type,
      input_data: data.input_data,
      output_data: data.output_data,
      execution_time_ms: data.execution_time_ms,
      efficiency_improvement: data.efficiency_improvement,
      cost_savings: data.cost_savings,
      algorithm_version: data.algorithm_version,
      status: data.status,
      error_details: data.error_details
    });
  };

  return AIOptimizationLog;
};
