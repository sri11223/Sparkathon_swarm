'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    
    // Create additional ENUM types
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE achievement_type AS ENUM ('deliveries_completed', 'hubs_managed', 'earnings_milestone', 'community_service', 'quality_rating', 'time_record');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE badge_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE promotion_type AS ENUM ('discount', 'cashback', 'bogo', 'free_delivery', 'hub_bonus');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE return_status AS ENUM ('pending', 'approved', 'rejected', 'completed', 'refunded');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE subscription_type AS ENUM ('email', 'sms', 'push', 'in_app');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 1. GAMIFICATION SYSTEM TABLES
    
    // User achievements and badges
    await queryInterface.createTable('user_achievements', {
      achievement_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      achievement_type: {
        type: 'achievement_type',
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      badge_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      badge_rarity: {
        type: 'badge_rarity',
        defaultValue: 'common'
      },
      points_earned: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      progress_current: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      progress_target: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      is_completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Community leaderboard
    await queryInterface.createTable('leaderboard', {
      leaderboard_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false // 'deliveries', 'earnings', 'hub_performance', 'customer_rating'
      },
      score: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      rank_position: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      period_type: {
        type: Sequelize.STRING(20),
        allowNull: false // 'daily', 'weekly', 'monthly', 'all_time'
      },
      period_start: {
        type: Sequelize.DATE,
        allowNull: false
      },
      period_end: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // 2. PROMOTIONS AND DISCOUNTS
    await queryInterface.createTable('promotions', {
      promotion_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      promotion_type: {
        type: 'promotion_type',
        allowNull: false
      },
      discount_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      min_order_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      max_discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      applicable_user_types: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true
      },
      applicable_hub_ids: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: true
      },
      applicable_product_categories: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true
      },
      usage_limit_per_user: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      total_usage_limit: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      current_usage_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      starts_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // User promotion usage tracking
    await queryInterface.createTable('user_promotion_usage', {
      usage_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      promotion_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'promotions',
          key: 'promotion_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'orders',
          key: 'order_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      discount_applied: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      used_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // 3. RETURNS AND REFUNDS SYSTEM
    await queryInterface.createTable('returns', {
      return_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'order_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      order_item_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'order_items',
          key: 'item_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      reason: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      detailed_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      return_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      refund_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      return_status: {
        type: 'return_status',
        defaultValue: 'pending'
      },
      return_method: {
        type: Sequelize.STRING(50),
        allowNull: false // 'walmart_store', 'hub_pickup', 'courier_pickup'
      },
      processed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      processing_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      requested_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      refunded_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // 4. SUBSCRIPTION AND NOTIFICATION PREFERENCES
    await queryInterface.createTable('notification_preferences', {
      preference_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      subscription_type: {
        type: 'subscription_type',
        allowNull: false
      },
      order_updates: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      delivery_notifications: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      promotional_offers: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      hub_inventory_alerts: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      earnings_reports: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      community_updates: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      emergency_alerts: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      frequency: {
        type: Sequelize.STRING(20),
        defaultValue: 'immediate' // 'immediate', 'daily', 'weekly'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // 5. COURIER VEHICLE INFORMATION
    await queryInterface.createTable('courier_vehicles', {
      vehicle_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      courier_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      vehicle_type: {
        type: Sequelize.STRING(50),
        allowNull: false // 'bicycle', 'motorcycle', 'car', 'van', 'truck'
      },
      make: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      model: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      license_plate: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      color: {
        type: Sequelize.STRING(30),
        allowNull: true
      },
      capacity_kg: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true
      },
      capacity_cubic_meters: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true
      },
      insurance_number: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      insurance_expires_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // 6. SYSTEM CONFIGURATIONS
    await queryInterface.createTable('system_configurations', {
      config_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      config_key: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      config_value: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      data_type: {
        type: Sequelize.STRING(20),
        allowNull: false // 'string', 'number', 'boolean', 'json', 'array'
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false // 'general', 'payment', 'notification', 'ai', 'crisis'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_sensitive: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      requires_restart: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // 7. PRODUCT REVIEWS AND RATINGS (separate from user ratings)
    await queryInterface.createTable('product_reviews', {
      review_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'product_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'orders',
          key: 'order_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      review_text: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_verified_purchase: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      helpful_votes: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      is_approved: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // 8. AI OPTIMIZATION LOGS
    await queryInterface.createTable('ai_optimization_logs', {
      log_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      optimization_type: {
        type: Sequelize.STRING(50),
        allowNull: false // 'route', 'inventory', 'warehouse', 'truck_loading'
      },
      input_data: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      output_data: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      execution_time_ms: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      efficiency_improvement: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true // percentage improvement
      },
      cost_savings: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      algorithm_version: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false // 'success', 'failed', 'partial'
      },
      error_details: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create indexes for performance
    await queryInterface.addIndex('user_achievements', ['user_id'], {
      name: 'idx_user_achievements_user_id'
    });
    
    await queryInterface.addIndex('user_achievements', ['achievement_type'], {
      name: 'idx_user_achievements_type'
    });

    await queryInterface.addIndex('leaderboard', ['category', 'period_type'], {
      name: 'idx_leaderboard_category_period'
    });

    await queryInterface.addIndex('leaderboard', ['user_id'], {
      name: 'idx_leaderboard_user_id'
    });

    await queryInterface.addIndex('promotions', ['is_active', 'starts_at', 'expires_at'], {
      name: 'idx_promotions_active_dates'
    });

    await queryInterface.addIndex('returns', ['customer_id'], {
      name: 'idx_returns_customer_id'
    });

    await queryInterface.addIndex('returns', ['return_status'], {
      name: 'idx_returns_status'
    });

    await queryInterface.addIndex('notification_preferences', ['user_id'], {
      name: 'idx_notification_preferences_user_id'
    });

    await queryInterface.addIndex('courier_vehicles', ['courier_id'], {
      name: 'idx_courier_vehicles_courier_id'
    });

    await queryInterface.addIndex('product_reviews', ['product_id'], {
      name: 'idx_product_reviews_product_id'
    });

    await queryInterface.addIndex('product_reviews', ['customer_id'], {
      name: 'idx_product_reviews_customer_id'
    });

    await queryInterface.addIndex('ai_optimization_logs', ['optimization_type'], {
      name: 'idx_ai_optimization_logs_type'
    });

    await queryInterface.addIndex('ai_optimization_logs', ['created_at'], {
      name: 'idx_ai_optimization_logs_created_at'
    });

  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order (to handle foreign key constraints)
    await queryInterface.dropTable('ai_optimization_logs');
    await queryInterface.dropTable('product_reviews');
    await queryInterface.dropTable('system_configurations');
    await queryInterface.dropTable('courier_vehicles');
    await queryInterface.dropTable('notification_preferences');
    await queryInterface.dropTable('returns');
    await queryInterface.dropTable('user_promotion_usage');
    await queryInterface.dropTable('promotions');
    await queryInterface.dropTable('leaderboard');
    await queryInterface.dropTable('user_achievements');

    // Drop ENUM types
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS achievement_type;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS badge_rarity;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS promotion_type;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS return_status;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS subscription_type;');
  }
};
