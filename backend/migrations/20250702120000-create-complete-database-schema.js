'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Enable PostGIS extension
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    
    // Create ENUM types
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('customer', 'hub_owner', 'courier', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE hub_status AS ENUM ('pending', 'active', 'inactive', 'crisis_mode');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'ready_for_pickup', 'out_for_delivery', 'completed', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE order_type AS ENUM ('delivery', 'drive_thru_pickup');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE delivery_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'failed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE notification_type AS ENUM ('order', 'delivery', 'hub', 'system', 'emergency');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 1. USERS TABLE
    await queryInterface.createTable('users', {
      user_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      middle_name: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      phone_number: {
        type: Sequelize.STRING(20),
        unique: true
      },
      role: {
        type: 'user_role',
        allowNull: false
      },
      date_of_birth: {
        type: Sequelize.DATE
      },
      address: {
        type: Sequelize.TEXT
      },
      emergency_contact_name: {
        type: Sequelize.STRING(100)
      },
      emergency_contact_phone: {
        type: Sequelize.STRING(20)
      },
      profile_image_url: {
        type: Sequelize.TEXT
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      verification_token: {
        type: Sequelize.STRING(255)
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      last_login_at: {
        type: Sequelize.DATE
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // 2. HUBS TABLE
    await queryInterface.createTable('hubs', {
      hub_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      location: {
        type: Sequelize.GEOGRAPHY('POINT', 4326)
      },
      capacity_m3: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      current_utilization_m3: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      status: {
        type: 'hub_status',
        allowNull: false,
        defaultValue: 'pending'
      },
      operating_hours_start: {
        type: Sequelize.TIME
      },
      operating_hours_end: {
        type: Sequelize.TIME
      },
      drive_thru_available: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      contact_phone: {
        type: Sequelize.STRING(20)
      },
      instructions: {
        type: Sequelize.TEXT
      },
      rating: {
        type: Sequelize.DECIMAL(2, 1),
        defaultValue: 0
      },
      total_orders: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      monthly_earnings: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // 3. PRODUCTS TABLE
    await queryInterface.createTable('products', {
      product_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      sku: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      walmart_item_id: {
        type: Sequelize.STRING(50),
        unique: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      category: {
        type: Sequelize.STRING(100)
      },
      subcategory: {
        type: Sequelize.STRING(100)
      },
      brand: {
        type: Sequelize.STRING(100)
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      weight_kg: {
        type: Sequelize.DECIMAL(8, 3)
      },
      volume_m3: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false
      },
      dimensions_length: {
        type: Sequelize.DECIMAL(8, 2)
      },
      dimensions_width: {
        type: Sequelize.DECIMAL(8, 2)
      },
      dimensions_height: {
        type: Sequelize.DECIMAL(8, 2)
      },
      image_url: {
        type: Sequelize.TEXT
      },
      barcode: {
        type: Sequelize.STRING(50)
      },
      is_perishable: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      shelf_life_days: {
        type: Sequelize.INTEGER
      },
      temperature_requirements: {
        type: Sequelize.STRING(50)
      },
      is_fragile: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // 4. HUB_INVENTORY TABLE (Junction table for Hub-Product relationship)
    await queryInterface.createTable('hub_inventory', {
      hub_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {
          model: 'hubs',
          key: 'hub_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {
          model: 'products',
          key: 'product_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      available_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      reserved_quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      reorder_point: {
        type: Sequelize.INTEGER,
        defaultValue: 5
      },
      max_stock_level: {
        type: Sequelize.INTEGER,
        defaultValue: 100
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2)
      },
      last_stocked_at: {
        type: Sequelize.DATE
      },
      expiry_date: {
        type: Sequelize.DATE
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // 5. ORDERS TABLE
    await queryInterface.createTable('orders', {
      order_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
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
      hub_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'hubs',
          key: 'hub_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      status: {
        type: 'order_status',
        allowNull: false,
        defaultValue: 'pending'
      },
      order_type: {
        type: 'order_type',
        allowNull: false
      },
      total_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      delivery_fee: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      service_fee: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      pickup_code: {
        type: Sequelize.STRING(10)
      },
      delivery_address: {
        type: Sequelize.TEXT
      },
      delivery_location: {
        type: Sequelize.GEOGRAPHY('POINT', 4326)
      },
      delivery_instructions: {
        type: Sequelize.TEXT
      },
      scheduled_pickup_time: {
        type: Sequelize.DATE
      },
      scheduled_delivery_time: {
        type: Sequelize.DATE
      },
      priority_level: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      notes: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // 6. ORDER_ITEMS TABLE
    await queryInterface.createTable('order_items', {
      order_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {
          model: 'orders',
          key: 'order_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {
          model: 'products',
          key: 'product_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      price_per_unit: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      total_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      special_instructions: {
        type: Sequelize.TEXT
      }
    });

    // 7. DELIVERIES TABLE
    await queryInterface.createTable('deliveries', {
      delivery_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'orders',
          key: 'order_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      courier_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      status: {
        type: 'delivery_status',
        allowNull: false,
        defaultValue: 'pending'
      },
      pickup_location: {
        type: Sequelize.GEOGRAPHY('POINT', 4326)
      },
      delivery_location: {
        type: Sequelize.GEOGRAPHY('POINT', 4326)
      },
      estimated_distance_km: {
        type: Sequelize.DECIMAL(8, 2)
      },
      estimated_duration_minutes: {
        type: Sequelize.INTEGER
      },
      actual_distance_km: {
        type: Sequelize.DECIMAL(8, 2)
      },
      actual_duration_minutes: {
        type: Sequelize.INTEGER
      },
      base_earnings: {
        type: Sequelize.DECIMAL(8, 2)
      },
      bonus_earnings: {
        type: Sequelize.DECIMAL(8, 2),
        defaultValue: 0
      },
      total_earnings: {
        type: Sequelize.DECIMAL(8, 2)
      },
      assigned_at: {
        type: Sequelize.DATE
      },
      picked_up_at: {
        type: Sequelize.DATE
      },
      delivered_at: {
        type: Sequelize.DATE
      },
      delivery_proof_url: {
        type: Sequelize.TEXT
      },
      customer_signature_url: {
        type: Sequelize.TEXT
      },
      notes: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // 8. PAYMENTS TABLE
    await queryInterface.createTable('payments', {
      payment_id: {
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
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: 'payment_status',
        allowNull: false,
        defaultValue: 'pending'
      },
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      stripe_payment_intent_id: {
        type: Sequelize.STRING(255)
      },
      stripe_charge_id: {
        type: Sequelize.STRING(255)
      },
      transaction_id: {
        type: Sequelize.STRING(255)
      },
      payment_gateway: {
        type: Sequelize.STRING(50),
        defaultValue: 'stripe'
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'USD'
      },
      processed_at: {
        type: Sequelize.DATE
      },
      failed_reason: {
        type: Sequelize.TEXT
      },
      refund_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      refunded_at: {
        type: Sequelize.DATE
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // 9. USER_RATINGS TABLE
    await queryInterface.createTable('user_ratings', {
      rating_id: {
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
      rater_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      rated_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      hub_id: {
        type: Sequelize.UUID,
        references: {
          model: 'hubs',
          key: 'hub_id'
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
      review_text: {
        type: Sequelize.TEXT
      },
      rating_type: {
        type: Sequelize.STRING(20),
        allowNull: false // 'customer_to_hub', 'customer_to_courier', 'hub_to_customer', 'courier_to_customer'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // 10. NOTIFICATIONS TABLE
    await queryInterface.createTable('notifications', {
      notification_id: {
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
      type: {
        type: 'notification_type',
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      data: {
        type: Sequelize.JSONB
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      read_at: {
        type: Sequelize.DATE
      },
      action_url: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // 11. ANALYTICS_EVENTS TABLE
    await queryInterface.createTable('analytics_events', {
      event_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      event_type: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      event_category: {
        type: Sequelize.STRING(50)
      },
      event_data: {
        type: Sequelize.JSONB
      },
      ip_address: {
        type: Sequelize.INET
      },
      user_agent: {
        type: Sequelize.TEXT
      },
      session_id: {
        type: Sequelize.STRING(255)
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // 12. SUPPORT_TICKETS TABLE
    await queryInterface.createTable('support_tickets', {
      ticket_id: {
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
      order_id: {
        type: Sequelize.UUID,
        references: {
          model: 'orders',
          key: 'order_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      category: {
        type: Sequelize.STRING(50)
      },
      priority: {
        type: Sequelize.STRING(20),
        defaultValue: 'medium'
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: 'open'
      },
      assigned_to: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      resolved_at: {
        type: Sequelize.DATE
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // 13. AI_RECOMMENDATIONS TABLE
    await queryInterface.createTable('ai_recommendations', {
      recommendation_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      hub_id: {
        type: Sequelize.UUID,
        references: {
          model: 'hubs',
          key: 'hub_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.UUID,
        references: {
          model: 'products',
          key: 'product_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      recommendation_type: {
        type: Sequelize.STRING(50),
        allowNull: false // 'restock', 'new_product', 'remove_product', 'price_adjustment'
      },
      confidence_score: {
        type: Sequelize.DECIMAL(3, 2)
      },
      recommended_quantity: {
        type: Sequelize.INTEGER
      },
      recommended_price: {
        type: Sequelize.DECIMAL(10, 2)
      },
      reasoning: {
        type: Sequelize.TEXT
      },
      metadata: {
        type: Sequelize.JSONB
      },
      is_applied: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      applied_at: {
        type: Sequelize.DATE
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // 14. EMERGENCY_CONTACTS TABLE (For Crisis Mode)
    await queryInterface.createTable('emergency_contacts', {
      contact_id: {
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
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      phone_number: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      relationship: {
        type: Sequelize.STRING(50)
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['phone_number']);
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('hubs', ['owner_id']);
    await queryInterface.addIndex('hubs', ['status']);
    await queryInterface.addIndex('hubs', {
      fields: ['location'],
      using: 'gist'
    });
    await queryInterface.addIndex('products', ['sku']);
    await queryInterface.addIndex('products', ['category']);
    await queryInterface.addIndex('orders', ['customer_id']);
    await queryInterface.addIndex('orders', ['hub_id']);
    await queryInterface.addIndex('orders', ['status']);
    await queryInterface.addIndex('orders', ['created_at']);
    await queryInterface.addIndex('deliveries', ['order_id']);
    await queryInterface.addIndex('deliveries', ['courier_id']);
    await queryInterface.addIndex('deliveries', ['status']);
    await queryInterface.addIndex('payments', ['order_id']);
    await queryInterface.addIndex('payments', ['user_id']);
    await queryInterface.addIndex('payments', ['status']);
    await queryInterface.addIndex('notifications', ['user_id']);
    await queryInterface.addIndex('notifications', ['is_read']);
    await queryInterface.addIndex('analytics_events', ['user_id']);
    await queryInterface.addIndex('analytics_events', ['event_type']);
    await queryInterface.addIndex('analytics_events', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order to avoid foreign key conflicts
    await queryInterface.dropTable('emergency_contacts');
    await queryInterface.dropTable('ai_recommendations');
    await queryInterface.dropTable('support_tickets');
    await queryInterface.dropTable('analytics_events');
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('user_ratings');
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('deliveries');
    await queryInterface.dropTable('order_items');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('hub_inventory');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('hubs');
    await queryInterface.dropTable('users');
    
    // Drop ENUM types
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS user_role;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS hub_status;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS order_status;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS order_type;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS delivery_status;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS payment_status;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS notification_type;');
  }
};
