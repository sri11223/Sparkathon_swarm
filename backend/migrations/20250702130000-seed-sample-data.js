'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create sample users
    const users = [
      {
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@example.com',
        password_hash: await bcrypt.hash('password123', 10),
        phone_number: '+1234567890',
        role: 'customer',
        address: '123 Main St, Springfield, IL 62701',
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: '550e8400-e29b-41d4-a716-446655440002',
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@example.com',
        password_hash: await bcrypt.hash('password123', 10),
        phone_number: '+1234567891',
        role: 'hub_owner',
        address: '456 Oak Ave, Springfield, IL 62702',
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: '550e8400-e29b-41d4-a716-446655440003',
        first_name: 'Mike',
        last_name: 'Wilson',
        email: 'mike.wilson@example.com',
        password_hash: await bcrypt.hash('password123', 10),
        phone_number: '+1234567892',
        role: 'courier',
        address: '789 Pine St, Springfield, IL 62703',
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: '550e8400-e29b-41d4-a716-446655440004',
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@swarmfill.com',
        password_hash: await bcrypt.hash('admin123', 10),
        phone_number: '+1234567893',
        role: 'admin',
        address: '100 Admin Blvd, Springfield, IL 62704',
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: '550e8400-e29b-41d4-a716-446655440005',
        first_name: 'Emily',
        last_name: 'Davis',
        email: 'emily.davis@example.com',
        password_hash: await bcrypt.hash('password123', 10),
        phone_number: '+1234567894',
        role: 'hub_owner',
        address: '321 Elm St, Springfield, IL 62705',
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users);

    // Create sample hubs
    const hubs = [
      {
        hub_id: '650e8400-e29b-41d4-a716-446655440001',
        owner_id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Sarah\'s Corner Hub',
        description: 'Convenient neighborhood hub with drive-thru service',
        address: '456 Oak Ave, Springfield, IL 62702',
        location: Sequelize.fn('ST_GeogFromText', 'POINT(-89.6501 39.7817)'),
        capacity_m3: 50.00,
        current_utilization_m3: 25.50,
        status: 'active',
        operating_hours_start: '08:00:00',
        operating_hours_end: '20:00:00',
        drive_thru_available: true,
        contact_phone: '+1234567891',
        instructions: 'Ring doorbell for pickup. Drive-thru available in driveway.',
        rating: 4.8,
        total_orders: 125,
        monthly_earnings: 850.00,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        hub_id: '650e8400-e29b-41d4-a716-446655440002',
        owner_id: '550e8400-e29b-41d4-a716-446655440005',
        name: 'Emily\'s Express Hub',
        description: 'Fast pickup and delivery service',
        address: '321 Elm St, Springfield, IL 62705',
        location: Sequelize.fn('ST_GeogFromText', 'POINT(-89.6520 39.7830)'),
        capacity_m3: 75.00,
        current_utilization_m3: 45.75,
        status: 'active',
        operating_hours_start: '07:00:00',
        operating_hours_end: '22:00:00',
        drive_thru_available: true,
        contact_phone: '+1234567894',
        instructions: 'Garage pickup available. Text upon arrival.',
        rating: 4.9,
        total_orders: 203,
        monthly_earnings: 1250.00,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('hubs', hubs);

    // Create sample products
    const products = [
      {
        product_id: '750e8400-e29b-41d4-a716-446655440001',
        sku: 'WMT-001',
        walmart_item_id: 'WMT123456',
        name: 'Organic Bananas (3 lbs)',
        description: 'Fresh organic bananas, perfect for snacking',
        category: 'Groceries',
        subcategory: 'Fresh Produce',
        brand: 'Great Value',
        price: 2.98,
        weight_kg: 1.36,
        volume_m3: 0.003,
        dimensions_length: 20.0,
        dimensions_width: 15.0,
        dimensions_height: 10.0,
        image_url: 'https://example.com/bananas.jpg',
        barcode: '1234567890123',
        is_perishable: true,
        shelf_life_days: 7,
        temperature_requirements: 'room_temperature',
        is_fragile: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        product_id: '750e8400-e29b-41d4-a716-446655440002',
        sku: 'WMT-002',
        walmart_item_id: 'WMT123457',
        name: 'Whole Milk (1 Gallon)',
        description: 'Fresh whole milk, vitamin D fortified',
        category: 'Groceries',
        subcategory: 'Dairy',
        brand: 'Great Value',
        price: 3.48,
        weight_kg: 3.78,
        volume_m3: 0.004,
        dimensions_length: 15.0,
        dimensions_width: 10.0,
        dimensions_height: 25.0,
        image_url: 'https://example.com/milk.jpg',
        barcode: '1234567890124',
        is_perishable: true,
        shelf_life_days: 14,
        temperature_requirements: 'refrigerated',
        is_fragile: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        product_id: '750e8400-e29b-41d4-a716-446655440003',
        sku: 'WMT-003',
        walmart_item_id: 'WMT123458',
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        category: 'Electronics',
        subcategory: 'Audio',
        brand: 'Sony',
        price: 89.99,
        weight_kg: 0.25,
        volume_m3: 0.002,
        dimensions_length: 18.0,
        dimensions_width: 15.0,
        dimensions_height: 8.0,
        image_url: 'https://example.com/headphones.jpg',
        barcode: '1234567890125',
        is_perishable: false,
        shelf_life_days: null,
        temperature_requirements: 'room_temperature',
        is_fragile: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('products', products);

    // Create hub inventory
    const hubInventory = [
      {
        hub_id: '650e8400-e29b-41d4-a716-446655440001',
        product_id: '750e8400-e29b-41d4-a716-446655440001',
        quantity: 50,
        available_quantity: 45,
        reserved_quantity: 5,
        reorder_point: 10,
        max_stock_level: 100,
        unit_price: 2.98,
        last_stocked_at: new Date(),
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        hub_id: '650e8400-e29b-41d4-a716-446655440001',
        product_id: '750e8400-e29b-41d4-a716-446655440002',
        quantity: 25,
        available_quantity: 22,
        reserved_quantity: 3,
        reorder_point: 5,
        max_stock_level: 50,
        unit_price: 3.48,
        last_stocked_at: new Date(),
        expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        hub_id: '650e8400-e29b-41d4-a716-446655440002',
        product_id: '750e8400-e29b-41d4-a716-446655440003',
        quantity: 15,
        available_quantity: 12,
        reserved_quantity: 3,
        reorder_point: 3,
        max_stock_level: 30,
        unit_price: 89.99,
        last_stocked_at: new Date(),
        expiry_date: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('hub_inventory', hubInventory);

    // Create sample orders
    const orders = [
      {
        order_id: '850e8400-e29b-41d4-a716-446655440001',
        customer_id: '550e8400-e29b-41d4-a716-446655440001',
        hub_id: '650e8400-e29b-41d4-a716-446655440001',
        status: 'completed',
        order_type: 'drive_thru_pickup',
        total_price: 6.46,
        subtotal: 6.46,
        tax_amount: 0.00,
        delivery_fee: 0.00,
        service_fee: 0.00,
        discount_amount: 0.00,
        pickup_code: 'PICK123',
        delivery_address: null,
        delivery_location: null,
        delivery_instructions: null,
        scheduled_pickup_time: new Date(),
        scheduled_delivery_time: null,
        priority_level: 1,
        notes: 'Quick pickup order',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        order_id: '850e8400-e29b-41d4-a716-446655440002',
        customer_id: '550e8400-e29b-41d4-a716-446655440001',
        hub_id: '650e8400-e29b-41d4-a716-446655440002',
        status: 'out_for_delivery',
        order_type: 'delivery',
        total_price: 94.99,
        subtotal: 89.99,
        tax_amount: 4.50,
        delivery_fee: 2.99,
        service_fee: 1.50,
        discount_amount: 3.99,
        pickup_code: null,
        delivery_address: '123 Main St, Springfield, IL 62701',
        delivery_location: Sequelize.fn('ST_GeogFromText', 'POINT(-89.6500 39.7800)'),
        delivery_instructions: 'Leave at front door if no answer',
        scheduled_pickup_time: null,
        scheduled_delivery_time: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        priority_level: 2,
        notes: 'Electronics delivery - handle with care',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('orders', orders);

    // Create order items
    const orderItems = [
      {
        order_id: '850e8400-e29b-41d4-a716-446655440001',
        product_id: '750e8400-e29b-41d4-a716-446655440001',
        quantity: 1,
        price_per_unit: 2.98,
        total_price: 2.98,
        special_instructions: null
      },
      {
        order_id: '850e8400-e29b-41d4-a716-446655440001',
        product_id: '750e8400-e29b-41d4-a716-446655440002',
        quantity: 1,
        price_per_unit: 3.48,
        total_price: 3.48,
        special_instructions: null
      },
      {
        order_id: '850e8400-e29b-41d4-a716-446655440002',
        product_id: '750e8400-e29b-41d4-a716-446655440003',
        quantity: 1,
        price_per_unit: 89.99,
        total_price: 89.99,
        special_instructions: 'Original packaging required'
      }
    ];

    await queryInterface.bulkInsert('order_items', orderItems);

    // Create deliveries
    const deliveries = [
      {
        delivery_id: '950e8400-e29b-41d4-a716-446655440001',
        order_id: '850e8400-e29b-41d4-a716-446655440002',
        courier_id: '550e8400-e29b-41d4-a716-446655440003',
        status: 'in_progress',
        pickup_location: Sequelize.fn('ST_GeogFromText', 'POINT(-89.6520 39.7830)'),
        delivery_location: Sequelize.fn('ST_GeogFromText', 'POINT(-89.6500 39.7800)'),
        estimated_distance_km: 2.5,
        estimated_duration_minutes: 15,
        actual_distance_km: null,
        actual_duration_minutes: null,
        base_earnings: 5.00,
        bonus_earnings: 1.50,
        total_earnings: 6.50,
        assigned_at: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        picked_up_at: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        delivered_at: null,
        delivery_proof_url: null,
        customer_signature_url: null,
        notes: 'Customer prefers contactless delivery',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('deliveries', deliveries);

    // Create payments
    const payments = [
      {
        payment_id: '105e8400-e29b-41d4-a716-446655440001',
        order_id: '850e8400-e29b-41d4-a716-446655440001',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        amount: 6.46,
        status: 'completed',
        payment_method: 'credit_card',
        stripe_payment_intent_id: 'pi_test_123456789',
        stripe_charge_id: 'ch_test_123456789',
        transaction_id: 'txn_test_123456789',
        payment_gateway: 'stripe',
        currency: 'USD',
        processed_at: new Date(),
        failed_reason: null,
        refund_amount: 0.00,
        refunded_at: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        payment_id: '105e8400-e29b-41d4-a716-446655440002',
        order_id: '850e8400-e29b-41d4-a716-446655440002',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        amount: 94.99,
        status: 'processing',
        payment_method: 'credit_card',
        stripe_payment_intent_id: 'pi_test_123456790',
        stripe_charge_id: null,
        transaction_id: null,
        payment_gateway: 'stripe',
        currency: 'USD',
        processed_at: null,
        failed_reason: null,
        refund_amount: 0.00,
        refunded_at: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('payments', payments);

    // Create user ratings
    const userRatings = [
      {
        rating_id: '205e8400-e29b-41d4-a716-446655440001',
        order_id: '850e8400-e29b-41d4-a716-446655440001',
        rater_id: '550e8400-e29b-41d4-a716-446655440001',
        rated_user_id: '550e8400-e29b-41d4-a716-446655440002',
        hub_id: '650e8400-e29b-41d4-a716-446655440001',
        rating: 5,
        review_text: 'Excellent service! Very quick pickup and friendly service.',
        rating_type: 'customer_to_hub',
        created_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('user_ratings', userRatings);

    // Create notifications
    const notifications = [
      {
        notification_id: '305e8400-e29b-41d4-a716-446655440001',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        type: 'order',
        title: 'Order Ready for Pickup',
        message: 'Your order #PICK123 is ready for pickup at Sarah\'s Corner Hub',
        data: JSON.stringify({
          order_id: '850e8400-e29b-41d4-a716-446655440001',
          pickup_code: 'PICK123',
          hub_name: 'Sarah\'s Corner Hub'
        }),
        is_read: true,
        read_at: new Date(),
        action_url: '/orders/850e8400-e29b-41d4-a716-446655440001',
        created_at: new Date()
      },
      {
        notification_id: '305e8400-e29b-41d4-a716-446655440002',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        type: 'delivery',
        title: 'Order Out for Delivery',
        message: 'Your order is out for delivery and will arrive soon!',
        data: JSON.stringify({
          order_id: '850e8400-e29b-41d4-a716-446655440002',
          courier_name: 'Mike Wilson',
          estimated_arrival: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        }),
        is_read: false,
        read_at: null,
        action_url: '/orders/850e8400-e29b-41d4-a716-446655440002/track',
        created_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('notifications', notifications);

    // Create analytics events
    const analyticsEvents = [
      {
        event_id: '405e8400-e29b-41d4-a716-446655440001',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        event_type: 'order_placed',
        event_category: 'conversion',
        event_data: JSON.stringify({
          order_value: 6.46,
          order_type: 'drive_thru_pickup',
          hub_id: '650e8400-e29b-41d4-a716-446655440001',
          items_count: 2
        }),
        ip_address: '192.168.1.100',
        user_agent: 'SwarmFill-Mobile-App/1.0.0 (iOS 15.0)',
        session_id: 'sess_abc123def456',
        created_at: new Date()
      },
      {
        event_id: '405e8400-e29b-41d4-a716-446655440002',
        user_id: '550e8400-e29b-41d4-a716-446655440003',
        event_type: 'delivery_accepted',
        event_category: 'courier_action',
        event_data: JSON.stringify({
          order_id: '850e8400-e29b-41d4-a716-446655440002',
          estimated_earnings: 6.50,
          distance_km: 2.5
        }),
        ip_address: '192.168.1.101',
        user_agent: 'SwarmFill-Mobile-App/1.0.0 (Android 12)',
        session_id: 'sess_def456ghi789',
        created_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('analytics_events', analyticsEvents);

    // Create support tickets
    const supportTickets = [
      {
        ticket_id: '505e8400-e29b-41d4-a716-446655440001',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        order_id: null,
        subject: 'Unable to find nearby hubs',
        description: 'I\'m having trouble locating hubs in my area. The map shows no results.',
        category: 'technical_support',
        priority: 'medium',
        status: 'open',
        assigned_to: '550e8400-e29b-41d4-a716-446655440004',
        resolved_at: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('support_tickets', supportTickets);

    // Create AI recommendations
    const aiRecommendations = [
      {
        recommendation_id: '605e8400-e29b-41d4-a716-446655440001',
        hub_id: '650e8400-e29b-41d4-a716-446655440001',
        product_id: '750e8400-e29b-41d4-a716-446655440001',
        recommendation_type: 'restock',
        confidence_score: 0.89,
        recommended_quantity: 25,
        recommended_price: null,
        reasoning: 'Based on recent demand patterns and upcoming weekend, recommend restocking bananas to maintain service level.',
        metadata: JSON.stringify({
          demand_forecast: 45,
          current_stock: 45,
          safety_stock: 10,
          lead_time_days: 1
        }),
        is_applied: false,
        applied_at: null,
        created_at: new Date()
      },
      {
        recommendation_id: '605e8400-e29b-41d4-a716-446655440002',
        hub_id: '650e8400-e29b-41d4-a716-446655440002',
        product_id: null,
        recommendation_type: 'new_product',
        confidence_score: 0.76,
        recommended_quantity: 20,
        recommended_price: 15.99,
        reasoning: 'Local demand analysis suggests adding smartphone accessories would increase revenue by 15%.',
        metadata: JSON.stringify({
          market_analysis: 'high_demand',
          competitor_pricing: 18.99,
          profit_margin: 0.25
        }),
        is_applied: false,
        applied_at: null,
        created_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('ai_recommendations', aiRecommendations);

    // Create emergency contacts
    const emergencyContacts = [
      {
        contact_id: '705e8400-e29b-41d4-a716-446655440001',
        user_id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Robert Johnson',
        phone_number: '+1234567895',
        relationship: 'spouse',
        is_primary: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        contact_id: '705e8400-e29b-41d4-a716-446655440002',
        user_id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Maria Wilson',
        phone_number: '+1234567896',
        relationship: 'spouse',
        is_primary: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('emergency_contacts', emergencyContacts);
  },

  async down(queryInterface, Sequelize) {
    // Delete in reverse order to respect foreign key constraints
    await queryInterface.bulkDelete('emergency_contacts', null, {});
    await queryInterface.bulkDelete('ai_recommendations', null, {});
    await queryInterface.bulkDelete('support_tickets', null, {});
    await queryInterface.bulkDelete('analytics_events', null, {});
    await queryInterface.bulkDelete('notifications', null, {});
    await queryInterface.bulkDelete('user_ratings', null, {});
    await queryInterface.bulkDelete('payments', null, {});
    await queryInterface.bulkDelete('deliveries', null, {});
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('orders', null, {});
    await queryInterface.bulkDelete('hub_inventory', null, {});
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('hubs', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
