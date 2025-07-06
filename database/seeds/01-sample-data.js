const { User, Hub, Product, Inventory, Order, OrderItem, Delivery, CommunityHub, CrisisEvent, EmergencyHub } = require('../../backend/src/models');
const bcrypt = require('bcryptjs');
const logger = require('../../backend/src/utils/logger');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Create Admin User
    const hashedPassword = await bcrypt.hash('Admin123!@#', 10);
    const adminUser = await User.create({
      email: 'admin@swarmfill.com',
      password_hash: hashedPassword,
      first_name: 'System',
      last_name: 'Administrator',
      role: 'admin',
      is_verified: true,
      is_active: true
    });
    console.log('✅ Admin user created');

    // Create Sample Hub Owners
    const hubOwnerPassword = await bcrypt.hash('HubOwner123!', 10);
    const hubOwner1 = await User.create({
      email: 'owner1@example.com',
      password_hash: hubOwnerPassword,
      first_name: 'John',
      last_name: 'Doe',
      role: 'hub_owner',
      phone: '+1234567890',
      address: '123 Main St, New York, NY 10001',
      latitude: 40.7589,
      longitude: -73.9851,
      is_verified: true,
      is_active: true
    });

    const hubOwner2 = await User.create({
      email: 'owner2@example.com',
      password_hash: hubOwnerPassword,
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'hub_owner',
      phone: '+1234567891',
      address: '456 Broadway, New York, NY 10013',
      latitude: 40.7505,
      longitude: -73.9934,
      is_verified: true,
      is_active: true
    });
    console.log('✅ Hub owners created');

    // Create Sample Couriers
    const courierPassword = await bcrypt.hash('Courier123!', 10);
    const courier1 = await User.create({
      email: 'courier1@example.com',
      password_hash: courierPassword,
      first_name: 'Mike',
      last_name: 'Johnson',
      role: 'courier',
      phone: '+1234567892',
      address: '789 Brooklyn Ave, Brooklyn, NY 11201',
      latitude: 40.6892,
      longitude: -73.9442,
      is_available: true,
      is_verified: true,
      is_active: true
    });

    const courier2 = await User.create({
      email: 'courier2@example.com',
      password_hash: courierPassword,
      first_name: 'Sarah',
      last_name: 'Wilson',
      role: 'courier',
      phone: '+1234567893',
      address: '321 Queens Blvd, Queens, NY 11375',
      latitude: 40.7282,
      longitude: -73.7949,
      is_available: true,
      is_verified: true,
      is_active: true
    });
    console.log('✅ Couriers created');

    // Create Sample Customers
    const customerPassword = await bcrypt.hash('Customer123!', 10);
    const customer1 = await User.create({
      email: 'customer1@example.com',
      password_hash: customerPassword,
      first_name: 'Alice',
      last_name: 'Brown',
      role: 'customer',
      phone: '+1234567894',
      address: '555 Park Ave, New York, NY 10065',
      latitude: 40.7614,
      longitude: -73.9776,
      is_verified: true,
      is_active: true
    });

    const customer2 = await User.create({
      email: 'customer2@example.com',
      password_hash: customerPassword,
      first_name: 'Bob',
      last_name: 'Davis',
      role: 'customer',
      phone: '+1234567895',
      address: '777 Fifth Ave, New York, NY 10022',
      latitude: 40.7505,
      longitude: -73.9795,
      is_verified: true,
      is_active: true
    });
    console.log('✅ Customers created');

    // Create Sample Hubs
    const hub1 = await Hub.create({
      owner_id: hubOwner1.user_id,
      name: 'Downtown Grocery Hub',
      description: 'Fresh groceries and daily essentials in the heart of Manhattan',
      address: '123 Main St, New York, NY 10001',
      latitude: 40.7589,
      longitude: -73.9851,
      phone: '+1234567896',
      operating_hours: {
        monday: { open: '08:00', close: '22:00' },
        tuesday: { open: '08:00', close: '22:00' },
        wednesday: { open: '08:00', close: '22:00' },
        thursday: { open: '08:00', close: '22:00' },
        friday: { open: '08:00', close: '23:00' },
        saturday: { open: '09:00', close: '23:00' },
        sunday: { open: '09:00', close: '21:00' }
      },
      capacity_m3: 100,
      status: 'active'
    });

    const hub2 = await Hub.create({
      owner_id: hubOwner2.user_id,
      name: 'SoHo Electronics Store',
      description: 'Latest electronics and gadgets',
      address: '456 Broadway, New York, NY 10013',
      latitude: 40.7505,
      longitude: -73.9934,
      phone: '+1234567897',
      operating_hours: {
        monday: { open: '10:00', close: '20:00' },
        tuesday: { open: '10:00', close: '20:00' },
        wednesday: { open: '10:00', close: '20:00' },
        thursday: { open: '10:00', close: '20:00' },
        friday: { open: '10:00', close: '21:00' },
        saturday: { open: '10:00', close: '21:00' },
        sunday: { open: '11:00', close: '19:00' }
      },
      capacity_m3: 150,
      status: 'active'
    });

    const hub3 = await Hub.create({
      owner_id: hubOwner1.user_id,
      name: 'Central Warehouse',
      description: 'Main distribution center for bulk items',
      address: '999 Industrial Way, Long Island City, NY 11101',
      latitude: 40.7505,
      longitude: -73.9352,
      phone: '+1234567898',
      operating_hours: {
        monday: { open: '06:00', close: '18:00' },
        tuesday: { open: '06:00', close: '18:00' },
        wednesday: { open: '06:00', close: '18:00' },
        thursday: { open: '06:00', close: '18:00' },
        friday: { open: '06:00', close: '18:00' },
        saturday: { open: '08:00', close: '16:00' },
        sunday: { closed: true }
      },
      capacity_m3: 1000,
      status: 'active'
    });
    console.log('✅ Hubs created');

    // Create Sample Products
    const products = await Product.bulkCreate([
      {
        name: 'Organic Bananas',
        description: 'Fresh organic bananas, 1 lb bunch',
        category: 'Fruits',
        brand: 'Organic Farm',
        sku: 'ORG-BAN-001',
        base_price: 2.99,
        weight: 1.0,
        dimensions: { length: 20, width: 8, height: 5 },
        image_urls: ['https://example.com/banana1.jpg'],
        is_active: true
      },
      {
        name: 'Whole Milk',
        description: 'Fresh whole milk, 1 gallon',
        category: 'Dairy',
        brand: 'Farm Fresh',
        sku: 'MILK-WHL-001',
        base_price: 4.49,
        weight: 3.8,
        dimensions: { length: 15, width: 15, height: 25 },
        image_urls: ['https://example.com/milk1.jpg'],
        is_active: true
      },
      {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with advanced camera system',
        category: 'Electronics',
        brand: 'Apple',
        sku: 'APPL-IP15P-128',
        base_price: 999.99,
        weight: 0.2,
        dimensions: { length: 15, width: 7, height: 1 },
        image_urls: ['https://example.com/iphone15.jpg'],
        is_active: true
      },
      {
        name: 'Samsung 65" 4K TV',
        description: 'Ultra-high definition smart TV',
        category: 'Electronics',
        brand: 'Samsung',
        sku: 'SAMS-TV65-4K',
        base_price: 799.99,
        weight: 25.0,
        dimensions: { length: 144, width: 83, height: 8 },
        image_urls: ['https://example.com/samsung-tv.jpg'],
        is_active: true
      },
      {
        name: 'Wireless Headphones',
        description: 'Noise-canceling wireless headphones',
        category: 'Electronics',
        brand: 'Sony',
        sku: 'SONY-WH-1000',
        base_price: 299.99,
        weight: 0.3,
        dimensions: { length: 20, width: 18, height: 8 },
        image_urls: ['https://example.com/headphones.jpg'],
        is_active: true
      },
      {
        name: 'Bread - Whole Wheat',
        description: 'Fresh baked whole wheat bread loaf',
        category: 'Bakery',
        brand: 'Local Bakery',
        sku: 'BRED-WW-001',
        base_price: 3.99,
        weight: 1.5,
        dimensions: { length: 25, width: 12, height: 10 },
        image_urls: ['https://example.com/bread.jpg'],
        is_active: true
      }
    ]);
    console.log('✅ Products created');

    // Create Sample Inventory
    const inventoryItems = [];
    
    // Hub 1 (Grocery) - Food items
    inventoryItems.push(
      { hub_id: hub1.id, product_id: products[0].id, quantity: 100, price: 3.49, low_stock_threshold: 20 }, // Bananas
      { hub_id: hub1.id, product_id: products[1].id, quantity: 50, price: 4.99, low_stock_threshold: 10 }, // Milk
      { hub_id: hub1.id, product_id: products[5].id, quantity: 25, price: 4.49, low_stock_threshold: 5 }   // Bread
    );

    // Hub 2 (Electronics) - Tech items
    inventoryItems.push(
      { hub_id: hub2.id, product_id: products[2].id, quantity: 15, price: 1099.99, low_stock_threshold: 3 }, // iPhone
      { hub_id: hub2.id, product_id: products[3].id, quantity: 8, price: 849.99, low_stock_threshold: 2 },   // Samsung TV
      { hub_id: hub2.id, product_id: products[4].id, quantity: 20, price: 329.99, low_stock_threshold: 5 }   // Headphones
    );

    // Hub 3 (Warehouse) - Bulk items
    inventoryItems.push(
      { hub_id: hub3.id, product_id: products[0].id, quantity: 500, price: 2.99, low_stock_threshold: 100 }, // Bananas (bulk)
      { hub_id: hub3.id, product_id: products[1].id, quantity: 200, price: 4.49, low_stock_threshold: 50 },  // Milk (bulk)
      { hub_id: hub3.id, product_id: products[2].id, quantity: 50, price: 999.99, low_stock_threshold: 10 },  // iPhone (wholesale)
      { hub_id: hub3.id, product_id: products[3].id, quantity: 25, price: 799.99, low_stock_threshold: 5 }    // Samsung TV (wholesale)
    );

    await Inventory.bulkCreate(inventoryItems);
    console.log('✅ Inventory created');

    // Create Sample Orders
    const order1 = await Order.create({
      customer_id: customer1.id,
      hub_id: hub1.id,
      total_price: 8.48,
      status: 'delivered',
      delivery_address: '555 Park Ave, New York, NY 10065',
      delivery_latitude: 40.7614,
      delivery_longitude: -73.9776
    });

    await OrderItem.bulkCreate([
      { order_id: order1.id, product_id: products[0].id, quantity: 1, price: 3.49 },
      { order_id: order1.id, product_id: products[1].id, quantity: 1, price: 4.99 }
    ]);

    await Delivery.create({
      order_id: order1.id,
      courier_id: courier1.id,
      status: 'completed',
      pickup_time: new Date(),
      delivery_time: new Date()
    });

    const order2 = await Order.create({
      customer_id: customer2.id,
      hub_id: hub2.id,
      total_price: 1429.98,
      status: 'in_transit',
      delivery_address: '777 Fifth Ave, New York, NY 10022',
      delivery_latitude: 40.7505,
      delivery_longitude: -73.9795
    });

    await OrderItem.bulkCreate([
      { order_id: order2.id, product_id: products[2].id, quantity: 1, price: 1099.99 },
      { order_id: order2.id, product_id: products[4].id, quantity: 1, price: 329.99 }
    ]);

    await Delivery.create({
      order_id: order2.id,
      courier_id: courier2.id,
      status: 'in_progress',
      pickup_time: new Date()
    });
    console.log('✅ Orders and Deliveries created');

    // Create Community Hub
    const communityHub = await CommunityHub.create({
      hub_id: hub1.id,
      community_name: 'Downtown Community',
      community_leader_id: hubOwner1.id
    });
    console.log('✅ Community Hub created');

    // Create Crisis Event
    const crisisEvent = await CrisisEvent.create({
      title: 'Hurricane Sandy',
      description: 'A major hurricane is approaching the city.',
      crisis_type: 'natural_disaster',
      severity_level: 'high',
      created_by: adminUser.id
    });

    await EmergencyHub.create({
      hub_id: hub3.id,
      crisis_event_id: crisisEvent.id,
      emergency_role: 'supply_center',
      volunteer_coordinator_id: hubOwner1.id
    });
    console.log('✅ Crisis Event and Emergency Hub created');

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

module.exports = { seedDatabase };