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
const Notification = require('./Notification')(sequelize);
const AnalyticsEvent = require('./AnalyticsEvent')(sequelize);
const UserRating = require('./UserRating')(sequelize);
const Voucher = require('./Voucher')(sequelize);
const OrderVoucher = require('./OrderVoucher')(sequelize);
const StockoutEvent = require('./StockoutEvent')(sequelize);
const SystemLog = require('./SystemLog')(sequelize);
const Payout = require('./Payout')(sequelize);
const Transaction = require('./Transaction')(sequelize);
const CommunityHub = require('./CommunityHub')(sequelize);
const CrisisEvent = require('./CrisisEvent')(sequelize);
const EmergencyHub = require('./EmergencyHub')(sequelize);
const CommunityChallenge = require('./CommunityChallenge')(sequelize);
const PushNotificationToken = require('./PushNotificationToken')(sequelize);
const SmartLoadOptimization = require('./SmartLoadOptimization')(sequelize);
const CommunityEarnings = require('./CommunityEarnings')(sequelize);
const SafetyReport = require('./SafetyReport')(sequelize);
const CommunityLeaderboard = require('./CommunityLeaderboard')(sequelize);

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

  // New model associations
  
  // Payout associations
  Payout.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });
  Payout.hasMany(Transaction, {
    foreignKey: 'payout_id',
    as: 'transactions'
  });

  // Transaction associations
  Transaction.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });
  Transaction.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order'
  });
  Transaction.belongsTo(Payout, {
    foreignKey: 'payout_id',
    as: 'payout'
  });

  // CommunityHub associations
  CommunityHub.belongsTo(Hub, {
    foreignKey: 'hub_id',
    as: 'hub'
  });
  CommunityHub.belongsTo(User, {
    foreignKey: 'community_leader_id',
    as: 'communityLeader'
  });
  CommunityHub.hasMany(CommunityEarnings, {
    foreignKey: 'community_hub_id',
    as: 'earnings'
  });

  // CrisisEvent associations
  CrisisEvent.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
  });
  CrisisEvent.hasMany(EmergencyHub, {
    foreignKey: 'crisis_event_id',
    as: 'emergencyHubs'
  });

  // EmergencyHub associations
  EmergencyHub.belongsTo(Hub, {
    foreignKey: 'hub_id',
    as: 'hub'
  });
  EmergencyHub.belongsTo(CrisisEvent, {
    foreignKey: 'crisis_event_id',
    as: 'crisisEvent'
  });
  EmergencyHub.belongsTo(User, {
    foreignKey: 'volunteer_coordinator_id',
    as: 'coordinator'
  });

  // CommunityChallenge associations
  CommunityChallenge.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
  });

  // PushNotificationToken associations
  PushNotificationToken.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });
  User.hasMany(PushNotificationToken, {
    foreignKey: 'user_id',
    as: 'pushTokens',
    onDelete: 'CASCADE'
  });

  // SmartLoadOptimization associations
  SmartLoadOptimization.belongsTo(User, {
    foreignKey: 'requested_by',
    as: 'requester'
  });
  SmartLoadOptimization.belongsTo(Hub, {
    foreignKey: 'hub_id',
    as: 'hub'
  });
  SmartLoadOptimization.belongsTo(CourierVehicle, {
    foreignKey: 'vehicle_id',
    as: 'vehicle'
  });

  // CommunityEarnings associations
  CommunityEarnings.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });
  CommunityEarnings.belongsTo(Hub, {
    foreignKey: 'hub_id',
    as: 'hub'
  });
  CommunityEarnings.belongsTo(CommunityHub, {
    foreignKey: 'community_hub_id',
    as: 'communityHub'
  });
  CommunityEarnings.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order'
  });
  User.hasMany(CommunityEarnings, {
    foreignKey: 'user_id',
    as: 'earnings',
    onDelete: 'CASCADE'
  });

  // SafetyReport associations
  SafetyReport.belongsTo(User, {
    foreignKey: 'reported_by',
    as: 'reporter'
  });
  SafetyReport.belongsTo(User, {
    foreignKey: 'reported_user_id',
    as: 'reportedUser'
  });
  SafetyReport.belongsTo(Hub, {
    foreignKey: 'hub_id',
    as: 'hub'
  });
  SafetyReport.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order'
  });

  // CommunityLeaderboard associations
  CommunityLeaderboard.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });
  CommunityLeaderboard.belongsTo(Hub, {
    foreignKey: 'hub_id',
    as: 'hub'
  });
  CommunityLeaderboard.belongsTo(CommunityChallenge, {
    foreignKey: 'challenge_id',
    as: 'challenge'
  });
  User.hasMany(CommunityLeaderboard, {
    foreignKey: 'user_id',
    as: 'leaderboardEntries',
    onDelete: 'CASCADE'
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
  Notification,
  AnalyticsEvent,
  UserRating,
  Voucher,
  OrderVoucher,
  StockoutEvent,
  SystemLog,
  Payout,
  Transaction,
  CommunityHub,
  CrisisEvent,
  EmergencyHub,
  CommunityChallenge,
  PushNotificationToken,
  SmartLoadOptimization,
  CommunityEarnings,
  SafetyReport,
  CommunityLeaderboard,
  syncDatabase
};
