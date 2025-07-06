require('dotenv').config({ path: './.env' });
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// --- CONFIGURATION ---
const USER_COUNT = 30;
const HUB_COUNT = 6; // Increased to allow for inactive/empty hubs
const PRODUCT_COUNT = 50;
const ORDER_COUNT = 40;
const RATING_CHANCE = 0.7;
// --- END CONFIGURATION ---

const pool = new Pool({
  user: process.env.DB_USER || 'swarmfill_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'swarmfill_db',
  password: process.env.DB_PASSWORD || 'swarmfill123',
  port: process.env.DB_PORT || 5432,
});

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDatabase = async () => {
  const client = await pool.connect();
  console.log('🚀 Starting comprehensive database seeding with edge cases...');
  console.log('✅ DB connection established.');

  try {
    await client.query('BEGIN');

    console.log('🌪️ Wiping all existing data...');
    const tables = [
      'community_leaderboards', 'safety_reports', 'community_earnings', 'smartload_optimizations', 
      'push_notification_tokens', 'community_challenges', 'emergency_hubs', 'crisis_events', 'community_hubs',
      'analytics_events', 'user_ratings', 'ai_optimization_logs', 'order_vouchers', 
      'vouchers', 'system_logs', 'notifications', 'stockout_events', 
      'demand_predictions', 'demand_signals', 'deliveries', 'order_items', 
      'orders', 'inventory', 'products', 'courier_vehicles', 'hubs', 'users'
    ];
    await client.query(`TRUNCATE TABLE ${tables.join(', ')} RESTART IDENTITY CASCADE`);
    console.log('✅ All tables wiped clean.');

    // --- USERS (with edge cases) ---
    console.log(`🌱 Creating ${USER_COUNT} users...`);
    const password_hash = await bcrypt.hash('password123', 10);
    let createdUsers = [];
    for (let i = 0; i < USER_COUNT; i++) {
      let role = 'customer';
      if (i < HUB_COUNT) role = 'hub_owner';
      else if (i < HUB_COUNT + 10) role = 'courier';
      else if (i === USER_COUNT - 1) role = 'admin';
      
      let background_check_status = (role === 'courier' || role === 'hub_owner') ? 'passed' : null;
      if (role === 'courier' && i === HUB_COUNT) background_check_status = 'pending';
      if (role === 'courier' && i === HUB_COUNT + 1) background_check_status = 'failed';

      const is_email_verified = i % 5 !== 0; // ~20% of users are not verified
      const res = await client.query(
        `INSERT INTO users (
          user_id, first_name, middle_name, last_name, email, password_hash, 
          phone_number, role, is_active, last_login, background_check_status, 
          is_email_verified, email_verification_token, email_verification_expires,
          created_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()) RETURNING *`,
        [
          faker.string.uuid(),
          faker.person.firstName(),
          faker.person.middleName(),
          faker.person.lastName(),
          faker.internet.email({ allowSpecialCharacters: false }),
          password_hash,
          faker.phone.number().slice(0, 20),
          role,
          i % 10 !== 0, // ~10% of users are inactive
          faker.date.recent({ days: 30 }),
          background_check_status,
          is_email_verified,
          is_email_verified ? null : faker.string.uuid(),
          is_email_verified ? null : faker.date.future({ years: 1 }),
        ]
      );
      createdUsers.push(res.rows[0]);
    }
    const hubOwners = createdUsers.filter(u => u.role === 'hub_owner');
    const customers = createdUsers.filter(u => u.role === 'customer');
    const couriers = createdUsers.filter(u => u.role === 'courier' && u.background_check_status === 'passed');
    const adminUser = createdUsers.find(u => u.role === 'admin');
    console.log(`✅ ${createdUsers.length} users created (including pending/failed).`);

    // --- SYSTEM LOG for failed background check ---
    const failedCourier = createdUsers.find(u => u.background_check_status === 'failed');
    if (failedCourier) {
        await client.query(
            `INSERT INTO system_logs (actor_id, action, details, created_at) VALUES ($1, $2, $3, NOW())`,
            [adminUser.user_id, 'USER_BACKGROUND_CHECK_FAILED', { user_id: failedCourier.user_id, reason: 'Flagged in external check.' }]
        );
        console.log('✅ System log created for failed background check.');
    }

    // --- VEHICLES (with edge cases) ---
    console.log('🌱 Creating courier vehicles...');
    let createdVehicles = [];
    for (const courier of couriers) {
        const status = courier.user_id === couriers[0].user_id ? 'pending_approval' : 'active';
        const res = await client.query(
            `INSERT INTO courier_vehicles (vehicle_id, courier_id, make, model, year, license_plate, color, vehicle_type, capacity_m3, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING *`,
            [faker.string.uuid(), courier.user_id, faker.vehicle.manufacturer(), faker.vehicle.model(), faker.number.int({min: 2015, max: 2024}), faker.vehicle.vrm(), faker.vehicle.color(), 'sedan', 1.5, status]
        );
        createdVehicles.push(res.rows[0]);
    }
    console.log(`✅ ${createdVehicles.length} vehicles created (including pending).`);

    // --- HUBS (with edge cases) ---
    console.log(`🌱 Creating ${HUB_COUNT} hubs...`);
    let createdHubs = [];
    for (let i = 0; i < hubOwners.length; i++) {
        let status = 'active';
        if (i === hubOwners.length - 1) status = 'inactive'; // Last hub is inactive
        if (i === hubOwners.length - 2) status = 'crisis_mode'; // Second to last is in crisis mode

        const hubName = `${faker.company.name()} Hub`;
        const description = `A community hub serving ${faker.location.city()} area with ${faker.commerce.department()} supplies and local products.`;
        
        const res = await client.query(
            `INSERT INTO hubs (hub_id, owner_id, name, address, location, capacity_m3, description, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), $7, $8, $9, NOW(), NOW()) RETURNING *`,
            [faker.string.uuid(), hubOwners[i].user_id, hubName, faker.location.streetAddress(true), faker.location.longitude(), faker.location.latitude(), faker.number.int({ min: 20, max: 100 }), description, status]
        );
        createdHubs.push(res.rows[0]);
    }
    const activeHubs = createdHubs.filter(h => h.status === 'active');
    const crisisHub = createdHubs.find(h => h.status === 'crisis_mode');
    console.log(`✅ ${createdHubs.length} hubs created (including inactive and crisis_mode).`);

    // --- SYSTEM LOG for crisis mode activation ---
    if (crisisHub) {
        await client.query(
            `INSERT INTO system_logs (actor_id, action, details, created_at) VALUES ($1, $2, $3, NOW())`,
            [adminUser.user_id, 'CRISIS_MODE_ACTIVATED', { hub_id: crisisHub.hub_id, reason: 'Emergency response for simulated event.' }]
        );
        console.log('✅ System log created for crisis mode activation.');
    }

    // --- PRODUCTS & INVENTORY (with empty hub) ---
    console.log(`🌱 Creating ${PRODUCT_COUNT} products...`);
    let createdProducts = [];
    for (let i = 0; i < PRODUCT_COUNT; i++) {
        const price = faker.commerce.price({ min: 1, max: 200 });
        const res = await client.query(
            `INSERT INTO products (product_id, sku, name, description, category, price, base_price, volume_m3, image_url, is_active, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING *`,
            [
                faker.string.uuid(), 
                `WALMART-${faker.string.alphanumeric(8).toUpperCase()}`, 
                faker.commerce.productName(), 
                faker.commerce.productDescription(), 
                faker.commerce.department(),
                price,
                price, // base_price same as price initially
                faker.number.float({ min: 0.001, max: 0.1, precision: 3 }), 
                faker.image.urlLoremFlickr({ category: 'technics' }),
                true // is_active
            ]
        );
        createdProducts.push(res.rows[0]);
    }
    console.log(`✅ ${createdProducts.length} products created.`);

    console.log('🌱 Populating hub inventories...');
    // Don't populate the last active hub, to simulate a new/empty one
    for (let i = 0; i < activeHubs.length - 1; i++) {
        const hub = activeHubs[i];
        const productsInHub = faker.helpers.shuffle(createdProducts).slice(0, faker.number.int({ min: PRODUCT_COUNT * 0.5, max: PRODUCT_COUNT * 0.9 }));
        for (const product of productsInHub) {
            const quantity = faker.number.int({ min: 10, max: 150 });
            const price = faker.commerce.price({ min: 1, max: 200 });
            await client.query(
                `INSERT INTO inventory (inventory_id, hub_id, product_id, quantity, reserved_quantity, price, low_stock_threshold, is_available, created_at, updated_at) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
                [faker.string.uuid(), hub.hub_id, product.product_id, quantity, 0, price, faker.number.int({ min: 5, max: 15 }), true]
            );
        }
    }
    console.log('✅ Hub inventories populated (including one empty hub).');

    // --- STOCKOUT SIMULATION ---
    console.log('🌱 Simulating a product stockout...');
    const busyHub = activeHubs[0];
    const popularProductRes = await client.query('SELECT * FROM inventory WHERE hub_id = $1 LIMIT 1', [busyHub.hub_id]);
    if (popularProductRes.rows.length > 0) {
        const popularProduct = popularProductRes.rows[0];
        const stockoutQuantity = popularProduct.quantity;
        
        const stockoutOrderRes = await client.query(
            `INSERT INTO orders (order_id, customer_id, hub_id, delivery_address, delivery_latitude, delivery_longitude, status, order_type, total_price, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, 'delivered', 'drive-thru', $7, NOW(), NOW()) RETURNING *`,
            [faker.string.uuid(), getRandom(customers).user_id, busyHub.hub_id, 
             faker.location.streetAddress(true), faker.location.latitude(), faker.location.longitude(),
             (stockoutQuantity * parseFloat(popularProduct.price)).toFixed(2)]
        );
        const stockoutOrder = stockoutOrderRes.rows[0];

        await client.query(
            `INSERT INTO order_items (order_id, product_id, quantity, price_per_unit) VALUES ($1, $2, $3, $4)`,
            [stockoutOrder.order_id, popularProduct.product_id, stockoutQuantity, popularProduct.price]
        );
        await client.query(
            `UPDATE inventory SET quantity = 0 WHERE hub_id = $1 AND product_id = $2`,
            [busyHub.hub_id, popularProduct.product_id]
        );
        await client.query(
            `INSERT INTO stockout_events (stockout_id, hub_id, product_id, stockout_time, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW(), NOW())`,
            [faker.string.uuid(), busyHub.hub_id, popularProduct.product_id]
        );
        console.log('✅ Stockout event created and logged.');
    }

    // --- ORDERS, DELIVERIES, RATINGS ---
    console.log(`🌱 Creating ${ORDER_COUNT} orders and related data...`);
    for (let i = 0; i < ORDER_COUNT; i++) {
      const hub = getRandom(activeHubs.slice(0, -1)); // Only order from non-empty, active hubs
      const inventoryRes = await client.query('SELECT * FROM inventory WHERE hub_id = $1 AND quantity > 0', [hub.hub_id]);
      if (inventoryRes.rows.length === 0) continue;
      
      const customer = getRandom(customers);
      const deliveryAddress = faker.location.streetAddress(true);
      const deliveryLat = faker.location.latitude();
      const deliveryLng = faker.location.longitude();
      
      const orderRes = await client.query(
        `INSERT INTO orders (order_id, customer_id, hub_id, delivery_address, delivery_latitude, delivery_longitude, status, order_type, total_price, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, 'delivered', 'delivery', 100.0, NOW(), NOW()) RETURNING *`,
        [faker.string.uuid(), customer.user_id, hub.hub_id, deliveryAddress, deliveryLat, deliveryLng]
      );
      const order = orderRes.rows[0];

      // Create a notification for the order
      await client.query(
        `INSERT INTO notifications (notification_id, user_id, title, body, type, related_entity_id, created_at, updated_at) VALUES ($1, $2, $3, $4, 'order_status', $5, NOW(), NOW())`,
        [faker.string.uuid(), customer.user_id, 'Order Confirmed!', `Your order #${order.order_id.slice(0,8)} has been confirmed.`, order.order_id]
      );
    }
    console.log(`✅ Orders and notifications created.`);

    // --- AI LOGS ---
    console.log('🌱 Generating analytics events...');
    for(const user of createdUsers) {
        for(let i = 0; i < 10; i++) {
            await client.query(
                `INSERT INTO analytics_events (event_id, user_id, session_id, event_type, payload, created_at) VALUES ($1, $2, $3, $4, $5, NOW())`,
                [faker.string.uuid(), user.user_id, faker.string.uuid(), getRandom(['page_view', 'add_to_cart', 'search']), { page: `/${faker.lorem.word()}` }]
            );
        }
    }
    console.log('✅ AI optimization logs created.');

    // --- COMMUNITY HUBS ---
    console.log('🌱 Creating community hubs...');
    let createdCommunityHubs = [];
    for (let i = 0; i < 3; i++) {
      const hubOwner = getRandom(hubOwners);
      const hub = getRandom(activeHubs); // Link to an existing hub
      const communityHubRes = await client.query(
        `INSERT INTO community_hubs (
          community_hub_id, hub_id, community_name, description, category, location, operating_hours, 
          contact_info, amenities, community_features, safety_rating, 
          hub_owner_id, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()) RETURNING *`,
        [
          faker.string.uuid(), // community_hub_id (PK)
          hub.hub_id, // hub_id (FK)
          `${faker.company.name()} Community Hub`,
          `A vibrant community space offering ${faker.commerce.department()} services and local marketplace`,
          getRandom(['local_marketplace', 'emergency_center', 'social_hub', 'skill_sharing']),
          JSON.stringify({
            latitude: faker.location.latitude(),
            longitude: faker.location.longitude(),
            address: faker.location.streetAddress(true),
            city: faker.location.city(),
            state: faker.location.state(),
            zip: faker.location.zipCode()
          }),
          JSON.stringify({
            monday: { open: '08:00', close: '20:00' },
            tuesday: { open: '08:00', close: '20:00' },
            wednesday: { open: '08:00', close: '20:00' },
            thursday: { open: '08:00', close: '20:00' },
            friday: { open: '08:00', close: '22:00' },
            saturday: { open: '09:00', close: '22:00' },
            sunday: { open: '10:00', close: '18:00' }
          }),
          JSON.stringify({
            phone: faker.phone.number(),
            email: faker.internet.email(),
            website: faker.internet.url()
          }),
          JSON.stringify(['wifi', 'parking', 'restrooms', 'wheelchair_accessible', 'food_court']),
          JSON.stringify({
            community_board: true,
            event_space: true,
            local_vendor_spots: true,
            skill_sharing_area: true
          }),
          faker.number.float({ min: 3.5, max: 5.0, precision: 0.1 }),
          hubOwner.user_id,
          'active'
        ]
      );
      createdCommunityHubs.push(communityHubRes.rows[0]);
    }
    console.log(`✅ ${createdCommunityHubs.length} community hubs created.`);

    // --- CRISIS EVENTS ---
    console.log('🌱 Creating crisis events...');
    const crisisEventRes = await client.query(
      `INSERT INTO crisis_events (
        crisis_event_id, event_name, event_type, severity_level, status, affected_areas, description, emergency_supplies_needed, volunteer_requirements, coordination_center, estimated_duration, priority_level, created_by, activated_at, resolved_at, public_information, response_metrics, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW()) RETURNING *`,
      [
        faker.string.uuid(),
        'Simulated Supply Chain Disruption', // event_name
        'supply_shortage', // event_type
        'medium', // severity_level
        'active', // status
        JSON.stringify([
          { area: faker.location.city(), severity: 'high' },
          { area: faker.location.city(), severity: 'medium' }
        ]),
        'A simulated crisis event to test emergency response capabilities and resource coordination', // description
        JSON.stringify(['food_supplies', 'medical_supplies', 'transportation', 'volunteers']), // emergency_supplies_needed
        JSON.stringify({ roles: ['volunteer', 'coordinator'] }), // volunteer_requirements
        JSON.stringify({ location: faker.location.streetAddress(true) }), // coordination_center
        '24h', // estimated_duration
        1, // priority_level
        adminUser.user_id, // created_by
        new Date(), // activated_at
        null, // resolved_at
        JSON.stringify({ info: 'Public info' }), // public_information
        JSON.stringify({ metric: 'test' }) // response_metrics
      ]
    );
    const crisisEvent = crisisEventRes.rows[0];

    // --- EMERGENCY HUBS ---
    console.log('🌱 Creating emergency hubs...');
    const emergencyHubRes = await client.query(
      `INSERT INTO emergency_hubs (
        emergency_hub_id, crisis_event_id, hub_id, emergency_role, capacity, 
        available_resources, volunteer_count, status, contact_person, 
        activation_time, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING *`,
      [
        faker.string.uuid(),
        crisisEvent.crisis_event_id,
        activeHubs[0].hub_id,
        'supply_center',
        JSON.stringify({
          people: 100,
          vehicles: 10,
          storage_m3: 200
        }),
        JSON.stringify(['emergency_food', 'water', 'medical_kits', 'blankets']),
        5,
        'operational',
        activeHubs[0].owner_id,
        new Date()
      ]
    );
    console.log('✅ Emergency hub created for crisis response.');

    // --- COMMUNITY CHALLENGES ---
    console.log('🌱 Creating community challenges...');
    for (let i = 0; i < 2; i++) {
      await client.query(
        `INSERT INTO community_challenges (
          challenge_id, title, description, challenge_type, reward_points, 
          monetary_reward, requirements, start_date, end_date, 
          participant_count, max_participants, status, created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`,
        [
          faker.string.uuid(),
          `${getRandom(['Eco-Friendly', 'Speed', 'Community Service', 'Innovation'])} Challenge`,
          `Join our community challenge to ${faker.lorem.sentence()}`,
          getRandom(['delivery_efficiency', 'sustainability', 'community_service', 'innovation']),
          faker.number.int({ min: 100, max: 500 }),
          faker.number.float({ min: 50, max: 200, precision: 0.01 }),
          JSON.stringify({
            min_deliveries: faker.number.int({ min: 5, max: 20 }),
            time_period: '7_days',
            criteria: 'Complete deliveries with high customer satisfaction'
          }),
          faker.date.recent({ days: 1 }),
          faker.date.future({ days: 7 }),
          0,
          faker.number.int({ min: 50, max: 200 }),
          'active',
          adminUser.user_id
        ]
      );
    }
    console.log('✅ Community challenges created.');

    // --- PUSH NOTIFICATION TOKENS ---
    console.log('🌱 Creating push notification tokens...');
    for (const user of createdUsers.slice(0, 20)) { // First 20 users have mobile apps
      await client.query(
        `INSERT INTO push_notification_tokens (
          token_id, user_id, device_token, device_type, device_info, 
          app_version, os_version, is_active, notification_preferences, 
          last_used, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
        [
          faker.string.uuid(),
          user.user_id,
          `${getRandom(['expo', 'fcm', 'apns'])}_${faker.string.alphanumeric(32)}`,
          getRandom(['ios', 'android']),
          JSON.stringify({
            device_name: faker.helpers.arrayElement(['iPhone 15', 'Samsung Galaxy S24', 'Google Pixel 8']),
            device_model: faker.helpers.arrayElement(['iPhone15,2', 'SM-S921B', 'GP8']),
            manufacturer: faker.helpers.arrayElement(['Apple', 'Samsung', 'Google'])
          }),
          '1.0.0',
          faker.helpers.arrayElement(['iOS 17.1', 'Android 14', 'iOS 16.5']),
          true,
          JSON.stringify({
            order_notifications: true,
            delivery_notifications: true,
            promotional_notifications: faker.datatype.boolean(),
            system_notifications: true,
            emergency_notifications: true,
            community_notifications: faker.datatype.boolean(),
            earnings_notifications: true
          }),
          faker.date.recent({ days: 7 })
        ]
      );
    }
    console.log('✅ Push notification tokens created for mobile users.');

    // --- SMART LOAD OPTIMIZATIONS ---
    console.log('🌱 Creating smart load optimizations...');
    for (const hub of activeHubs.slice(0, 3)) {
      await client.query(
        `INSERT INTO smartload_optimizations (
          optimization_id, hub_id, optimization_type, input_data, 
          optimization_results, efficiency_metrics, implementation_status, 
          estimated_savings, requested_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [
          faker.string.uuid(),
          hub.hub_id,
          getRandom(['warehouse_layout', 'truck_loading', 'inventory_placement', 'demand_forecast']),
          JSON.stringify({
            warehouse_dimensions: { length: 50, width: 30, height: 6 },
            current_layout: 'traditional',
            inventory_volume: 150,
            daily_orders: 100
          }),
          JSON.stringify({
            recommended_layout: 'zone_based',
            space_utilization: 85,
            picking_efficiency: 92,
            estimated_time_savings: 45
          }),
          JSON.stringify({
            space_efficiency: '85%',
            time_reduction: '45min/day',
            cost_savings: '$200/month'
          }),
          getRandom(['completed', 'in_progress', 'pending']),
          JSON.stringify({
            monthly_cost_savings: faker.number.float({ min: 100, max: 500, precision: 0.01 }),
            time_savings_hours: faker.number.float({ min: 10, max: 50, precision: 0.1 }),
            efficiency_gain_percent: faker.number.float({ min: 5, max: 25, precision: 0.1 })
          }),
          hub.owner_id
        ]
      );
    }
    console.log('✅ Smart load optimizations created.');

    // --- COMMUNITY EARNINGS ---
    console.log('🌱 Creating community earnings...');
    for (const courier of couriers.slice(0, 5)) {
      for (let i = 0; i < 3; i++) {
        await client.query(
          `INSERT INTO community_earnings (
            earning_id, user_id, earning_type, amount, points_earned, 
            source_id, description, payout_status, payout_date, 
            payment_method, metadata, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
          [
            faker.string.uuid(),
            courier.user_id,
            getRandom(['delivery_fee', 'bonus', 'challenge_reward', 'referral_bonus']),
            faker.number.float({ min: 15, max: 150, precision: 0.01 }),
            faker.number.int({ min: 10, max: 100 }),
            faker.string.uuid(), // reference to order or challenge
            `Earning from ${getRandom(['express delivery', 'weekend bonus', 'challenge completion', 'referral program'])}`,
            getRandom(['completed', 'pending', 'processing']),
            faker.date.recent({ days: 30 }),
            JSON.stringify({
              method: 'bank_transfer',
              account_last4: faker.finance.accountNumber(4)
            }),
            JSON.stringify({
              bonus_multiplier: faker.number.float({ min: 1.0, max: 2.0, precision: 0.1 }),
              performance_rating: faker.number.float({ min: 4.0, max: 5.0, precision: 0.1 })
            })
          ]
        );
      }
    }
    console.log('✅ Community earnings created.');

    // --- SAFETY REPORTS ---
    console.log('🌱 Creating safety reports...');
    for (let i = 0; i < 3; i++) {
      await client.query(
        `INSERT INTO safety_reports (
          report_id, reporter_id, incident_type, severity, location, 
          description, evidence, involved_parties, witness_info, 
          status, assigned_to, resolution_notes, resolved_at, 
          is_anonymous, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())`,
        [
          faker.string.uuid(),
          getRandom(createdUsers).user_id,
          getRandom(['accident', 'unsafe_conditions', 'theft', 'other']),
          getRandom(['low', 'medium', 'high']),
          JSON.stringify({
            latitude: faker.location.latitude(),
            longitude: faker.location.longitude(),
            address: faker.location.streetAddress(true),
            landmark: faker.company.name()
          }),
          `Safety incident reported: ${faker.lorem.paragraph()}`,
          JSON.stringify([]),
          JSON.stringify([]),
          JSON.stringify({}),
          getRandom(['reported', 'under_review', 'resolved']),
          adminUser.user_id,
          i === 0 ? 'Issue resolved through improved signage and lighting' : null,
          i === 0 ? faker.date.recent({ days: 5 }) : null,
          faker.datatype.boolean()
        ]
      );
    }
    console.log('✅ Safety reports created.');

    // --- COMMUNITY LEADERBOARDS ---
    console.log('🌱 Creating community leaderboards...');
    const currentWeek = new Date().toISOString().slice(0, 4) + '-W' + String(Math.ceil((new Date().getDate()) / 7)).padStart(2, '0');
    for (let i = 0; i < couriers.length; i++) {
      const courier = couriers[i];
      await client.query(
        `INSERT INTO community_leaderboards (
          leaderboard_id, user_id, leaderboard_type, period, rank, 
          score, metrics, achievements, rewards_earned, is_current, 
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
        [
          faker.string.uuid(),
          courier.user_id,
          'weekly_deliveries',
          currentWeek,
          i + 1,
          faker.number.float({ min: 50, max: 500, precision: 0.1 }),
          JSON.stringify({
            total_deliveries: faker.number.int({ min: 10, max: 50 }),
            avg_rating: faker.number.float({ min: 4.0, max: 5.0, precision: 0.1 }),
            on_time_percentage: faker.number.float({ min: 85, max: 100, precision: 0.1 }),
            distance_traveled: faker.number.float({ min: 100, max: 500, precision: 0.1 })
          }),
          JSON.stringify([
            { name: 'Speed Demon', description: 'Delivered 10+ orders in a day' },
            { name: 'Customer Favorite', description: 'Maintained 4.8+ rating' }
          ]),
          JSON.stringify([
            { reward: 'bonus_points', amount: 50 },
            { reward: 'badge', type: 'weekly_champion' }
          ]),
          true
        ]
      );
    }
    console.log('✅ Community leaderboards created.');

    await client.query('COMMIT');
    console.log('🎉 Comprehensive database seeding with edge cases completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed. Transaction rolled back.', error);
  } finally {
    client.release();
    await pool.end();
    console.log('👋 Database connection closed.');
  }
};

seedDatabase();