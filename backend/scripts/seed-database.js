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
      'analytics_events', 'user_ratings', 'ai_optimization_logs', 'order_vouchers', 
      'vouchers', 'system_logs', 'notifications', 'stockout_events', 
      'demand_predictions', 'demand_signals', 'deliveries', 'order_items', 
      'orders', 'hub_inventory', 'products', 'courier_vehicles', 'hubs', 'users'
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

        const res = await client.query(
            `INSERT INTO hubs (hub_id, owner_id, name, address, location, capacity_m3, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), $7, $8, NOW(), NOW()) RETURNING *`,
            [faker.string.uuid(), hubOwners[i].user_id, `${faker.company.name()} Hub`, faker.location.streetAddress(true), faker.location.longitude(), faker.location.latitude(), faker.number.int({ min: 20, max: 100 }), status]
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
        const res = await client.query(
            `INSERT INTO products (product_id, sku, name, description, price, volume_m3, image_url, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *`,
            [faker.string.uuid(), `WALMART-${faker.string.alphanumeric(8).toUpperCase()}`, faker.commerce.productName(), faker.commerce.productDescription(), faker.commerce.price({ min: 1, max: 200 }), faker.number.float({ min: 0.001, max: 0.1, precision: 3 }), faker.image.urlLoremFlickr({ category: 'technics' })]
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
            await client.query(
                `INSERT INTO hub_inventory (hub_id, product_id, quantity, available_quantity) VALUES ($1, $2, $3, $4)`,
                [hub.hub_id, product.product_id, quantity, quantity]
            );
        }
    }
    console.log('✅ Hub inventories populated (including one empty hub).');

    // --- STOCKOUT SIMULATION ---
    console.log('🌱 Simulating a product stockout...');
    const busyHub = activeHubs[0];
    const popularProductRes = await client.query('SELECT * FROM hub_inventory WHERE hub_id = $1 LIMIT 1', [busyHub.hub_id]);
    if (popularProductRes.rows.length > 0) {
        const popularProduct = popularProductRes.rows[0];
        const stockoutQuantity = popularProduct.available_quantity;
        
        const stockoutOrderRes = await client.query(
            `INSERT INTO orders (order_id, customer_id, hub_id, status, order_type, total_price, created_at, updated_at) VALUES ($1, $2, $3, 'completed', 'drive_thru_pickup', $4, NOW(), NOW()) RETURNING *`,
            [faker.string.uuid(), getRandom(customers).user_id, busyHub.hub_id, (stockoutQuantity * parseFloat(createdProducts.find(p => p.product_id === popularProduct.product_id).price)).toFixed(2)]
        );
        const stockoutOrder = stockoutOrderRes.rows[0];

        await client.query(
            `INSERT INTO order_items (order_id, product_id, quantity, price_per_unit) VALUES ($1, $2, $3, $4)`,
            [stockoutOrder.order_id, popularProduct.product_id, stockoutQuantity, createdProducts.find(p => p.product_id === popularProduct.product_id).price]
        );
        await client.query(
            `UPDATE hub_inventory SET available_quantity = 0 WHERE hub_id = $1 AND product_id = $2`,
            [busyHub.hub_id, popularProduct.product_id]
        );
        await client.query(
            `INSERT INTO stockout_events (stockout_id, hub_id, product_id, stockout_time) VALUES ($1, $2, $3, NOW())`,
            [faker.string.uuid(), busyHub.hub_id, popularProduct.product_id]
        );
        console.log('✅ Stockout event created and logged.');
    }

    // --- ORDERS, DELIVERIES, RATINGS ---
    console.log(`🌱 Creating ${ORDER_COUNT} orders and related data...`);
    for (let i = 0; i < ORDER_COUNT; i++) {
      const hub = getRandom(activeHubs.slice(0, -1)); // Only order from non-empty, active hubs
      const inventoryRes = await client.query('SELECT * FROM hub_inventory WHERE hub_id = $1 AND available_quantity > 0', [hub.hub_id]);
      if (inventoryRes.rows.length === 0) continue;
      
      const customer = getRandom(customers);
      const orderRes = await client.query(
        `INSERT INTO orders (order_id, customer_id, hub_id, status, order_type, total_price, created_at, updated_at) VALUES ($1, $2, $3, 'completed', 'delivery', 100.0, NOW(), NOW()) RETURNING *`,
        [faker.string.uuid(), customer.user_id, hub.hub_id]
      );
      const order = orderRes.rows[0];

      // Create a notification for the order
      await client.query(
        `INSERT INTO notifications (notification_id, user_id, title, body, type, related_entity_id) VALUES ($1, $2, $3, $4, 'order_status', $5)`,
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