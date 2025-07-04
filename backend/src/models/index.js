const { sequelize } = require('../config/database');

// Import all models
const User = require('./User')(sequelize);
const Hub = require('./Hub')(sequelize);
const Product = require('./Product')(sequelize);
const Inventory = require('./Inventory')(sequelize);
const Order = require('./Order')(sequelize);
const OrderItem = require('./OrderItem')(sequelize);
const Delivery = require('./Delivery')(sequelize);
const CourierVehicle = require('./CourierVehicle')(sequelize);
const DriveThruSlot = require('./DriveThruSlot')(sequelize);
const DriveThruConfiguration = require('./DriveThruConfiguration')(sequelize);

// Define associations
const setupAssociations = () => {
  // User associations
  User.hasMany(Hub, { 
    foreignKey: 'owner_id', 
    as: 'ownedHubs',
    onDelete: 'CASCADE' 
  });
  User.hasMany(Order, { 
    foreignKey: 'customer_id', 
    as: 'customerOrders',
    onDelete: 'CASCADE' 
  });
  User.hasMany(Order, { 
    foreignKey: 'courier_id', 
    as: 'courierDeliveries',
    onDelete: 'SET NULL' 
  });

  // Hub associations
  Hub.belongsTo(User, { 
    foreignKey: 'owner_id', 
    as: 'owner' 
  });
  Hub.hasMany(Inventory, { 
    foreignKey: 'hub_id', 
    as: 'inventory',
    onDelete: 'CASCADE' 
  });
  Hub.hasMany(Order, { 
    foreignKey: 'hub_id', 
    as: 'orders',
    onDelete: 'SET NULL' 
  });
  Hub.hasOne(DriveThruConfiguration, {
    foreignKey: 'hub_id',
    as: 'driveThruConfig',
    onDelete: 'CASCADE'
  });
  Hub.hasMany(DriveThruSlot, {
    foreignKey: 'hub_id',
    as: 'driveThruSlots',
    onDelete: 'CASCADE'
  });

  // Product associations
  Product.hasMany(Inventory, { 
    foreignKey: 'product_id', 
    as: 'inventoryEntries',
    onDelete: 'CASCADE' 
  });
  Product.hasMany(OrderItem, { 
    foreignKey: 'product_id', 
    as: 'orderItems',
    onDelete: 'CASCADE' 
  });

  // Inventory associations
  Inventory.belongsTo(Hub, { 
    foreignKey: 'hub_id', 
    as: 'hub' 
  });
  Inventory.belongsTo(Product, { 
    foreignKey: 'product_id', 
    as: 'product' 
  });

  // Order associations
  Order.belongsTo(User, { 
    foreignKey: 'customer_id', 
    as: 'customer' 
  });
  Order.belongsTo(User, { 
    foreignKey: 'courier_id', 
    as: 'courier' 
  });
  Order.belongsTo(Hub, { 
    foreignKey: 'hub_id', 
    as: 'hub' 
  });
  Order.hasMany(OrderItem, { 
    foreignKey: 'order_id', 
    as: 'orderItems',
    onDelete: 'CASCADE' 
  });

  // OrderItem associations
  OrderItem.belongsTo(Order, { 
    foreignKey: 'order_id', 
    as: 'order' 
  });
  OrderItem.belongsTo(Product, { 
    foreignKey: 'product_id', 
    as: 'product' 
  });

  // DriveThruSlot associations
  DriveThruSlot.belongsTo(Hub, {
    foreignKey: 'hub_id',
    as: 'hub'
  });
  DriveThruSlot.belongsTo(User, {
    foreignKey: 'customer_id',
    as: 'customer'
  });
  DriveThruSlot.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order'
  });

  // User has many drive-thru slots
  User.hasMany(DriveThruSlot, {
    foreignKey: 'customer_id',
    as: 'driveThruSlots',
    onDelete: 'CASCADE'
  });

  // Order has one drive-thru slot
  Order.hasOne(DriveThruSlot, {
    foreignKey: 'order_id',
    as: 'driveThruSlot',
    onDelete: 'CASCADE'
  });

  // DriveThruConfiguration associations
  DriveThruConfiguration.belongsTo(Hub, {
    foreignKey: 'hub_id',
    as: 'hub'
  });

  // Delivery associations
  Delivery.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order'
  });
  Delivery.belongsTo(User, {
    foreignKey: 'courier_id',
    as: 'courier'
  });

  // Order has one delivery
  Order.hasOne(Delivery, {
    foreignKey: 'order_id',
    as: 'delivery',
    onDelete: 'CASCADE'
  });

  // User (courier) has many deliveries
  User.hasMany(Delivery, {
    foreignKey: 'courier_id',
    as: 'deliveries',
    onDelete: 'SET NULL'
  });

  // CourierVehicle associations
  CourierVehicle.belongsTo(User, {
    foreignKey: 'courier_id',
    as: 'courier'
  });
  CourierVehicle.hasMany(Delivery, {
    foreignKey: 'vehicle_id',
    as: 'deliveries',
    onDelete: 'SET NULL'
  });

  // User (courier) has many vehicles
  User.hasMany(CourierVehicle, {
    foreignKey: 'courier_id',
    as: 'vehicles',
    onDelete: 'CASCADE'
  });

  // Delivery belongs to a vehicle
  Delivery.belongsTo(CourierVehicle, {
    foreignKey: 'vehicle_id',
    as: 'vehicle'
  });
};

// Setup associations
setupAssociations();

// Sync database in development
const syncDatabase = async () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      await sequelize.sync({ alter: true });
      console.log('📊 Database models synchronized with associations');
    } catch (error) {
      console.error('❌ Database sync failed:', error);
      throw error;
    }
  }
};

module.exports = {
  sequelize,
  User,
  Hub,
  Product,
  Inventory,
  Order,
  OrderItem,
  Delivery,
  CourierVehicle,
  DriveThruSlot,
  DriveThruConfiguration,
  syncDatabase
};
