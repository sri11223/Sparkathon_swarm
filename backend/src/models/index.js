const { sequelize } = require('../config/database');

// Import all models
const User = require('./User')(sequelize);
const Hub = require('./Hub')(sequelize);
const Product = require('./Product')(sequelize);
const Inventory = require('./Inventory')(sequelize);
const Order = require('./Order')(sequelize);
const OrderItem = require('./OrderItem')(sequelize);
const Delivery = require('./Delivery')(sequelize);
const HubInventory = require('./HubInventory')(sequelize);
const Payment = require('./Payment')(sequelize);
const UserRating = require('./UserRating')(sequelize);
const Notification = require('./Notification')(sequelize);
const AnalyticsEvent = require('./AnalyticsEvent')(sequelize);
const SupportTicket = require('./SupportTicket')(sequelize);
const AIRecommendation = require('./AIRecommendation')(sequelize);
const EmergencyContact = require('./EmergencyContact')(sequelize);
const UserAchievement = require('./UserAchievement')(sequelize);
const Leaderboard = require('./Leaderboard')(sequelize);
const Promotion = require('./Promotion')(sequelize);
const UserPromotionUsage = require('./UserPromotionUsage')(sequelize);
const Return = require('./Return')(sequelize);
const NotificationPreference = require('./NotificationPreference')(sequelize);
const CourierVehicle = require('./CourierVehicle')(sequelize);
const SystemConfiguration = require('./SystemConfiguration')(sequelize);
const ProductReview = require('./ProductReview')(sequelize);
const AIOptimizationLog = require('./AIOptimizationLog')(sequelize);

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
  User.hasMany(Delivery, { 
    foreignKey: 'courier_id', 
    as: 'courierDeliveries',
    onDelete: 'SET NULL' 
  });
  User.hasMany(Payment, {
    foreignKey: 'user_id',
    as: 'payments',
    onDelete: 'CASCADE'
  });
  User.hasMany(UserRating, {
    foreignKey: 'rater_id',
    as: 'givenRatings',
    onDelete: 'CASCADE'
  });
  User.hasMany(UserRating, {
    foreignKey: 'rated_user_id',
    as: 'receivedRatings',
    onDelete: 'CASCADE'
  });
  User.hasMany(Notification, {
    foreignKey: 'user_id',
    as: 'notifications',
    onDelete: 'CASCADE'
  });
  User.hasMany(AnalyticsEvent, {
    foreignKey: 'user_id',
    as: 'analyticsEvents',
    onDelete: 'SET NULL'
  });
  User.hasMany(SupportTicket, {
    foreignKey: 'user_id',
    as: 'supportTickets',
    onDelete: 'CASCADE'
  });
  User.hasMany(SupportTicket, {
    foreignKey: 'assigned_to',
    as: 'assignedTickets',
    onDelete: 'SET NULL'
  });
  User.hasMany(EmergencyContact, {
    foreignKey: 'user_id',
    as: 'emergencyContacts',
    onDelete: 'CASCADE'
  });
  User.hasMany(UserAchievement, {
    foreignKey: 'user_id',
    as: 'achievements',
    onDelete: 'CASCADE'
  });
  User.hasMany(Leaderboard, {
    foreignKey: 'user_id',
    as: 'leaderboardEntries',
    onDelete: 'CASCADE'
  });
  User.hasMany(UserPromotionUsage, {
    foreignKey: 'user_id',
    as: 'promotionUsages',
    onDelete: 'CASCADE'
  });
  User.hasMany(Return, {
    foreignKey: 'customer_id',
    as: 'returns',
    onDelete: 'CASCADE'
  });
  User.hasOne(NotificationPreference, {
    foreignKey: 'user_id',
    as: 'notificationPreference',
    onDelete: 'CASCADE'
  });
  User.hasMany(CourierVehicle, {
    foreignKey: 'courier_id',
    as: 'vehicles',
    onDelete: 'CASCADE'
  });
  User.hasMany(ProductReview, {
    foreignKey: 'user_id',
    as: 'productReviews',
    onDelete: 'CASCADE'
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
  Hub.belongsToMany(Product, {
    through: HubInventory,
    foreignKey: 'hub_id',
    otherKey: 'product_id',
    as: 'products'
  });
  Hub.hasMany(UserRating, {
    foreignKey: 'hub_id',
    as: 'ratings',
    onDelete: 'SET NULL'
  });
  Hub.hasMany(AIRecommendation, {
    foreignKey: 'hub_id',
    as: 'aiRecommendations',
    onDelete: 'CASCADE'
  });
  Hub.hasMany(Return, {
    foreignKey: 'hub_id',
    as: 'returns',
    onDelete: 'SET NULL'
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
  Product.belongsToMany(Hub, {
    through: HubInventory,
    foreignKey: 'product_id',
    otherKey: 'hub_id',
    as: 'hubs'
  });
  Product.belongsToMany(Order, {
    through: OrderItem,
    foreignKey: 'product_id',
    otherKey: 'order_id',
    as: 'orders'
  });
  Product.hasMany(AIRecommendation, {
    foreignKey: 'product_id',
    as: 'aiRecommendations',
    onDelete: 'CASCADE'
  });
  Product.hasMany(Return, {
    foreignKey: 'product_id',
    as: 'returns',
    onDelete: 'SET NULL'
  });
  Product.hasMany(ProductReview, {
    foreignKey: 'product_id',
    as: 'reviews',
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

  // HubInventory associations (Junction table)
  HubInventory.belongsTo(Hub, {
    foreignKey: 'hub_id',
    as: 'hub'
  });
  HubInventory.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
  });

  // Order associations
  Order.belongsTo(User, { 
    foreignKey: 'customer_id', 
    as: 'customer' 
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
  Order.hasOne(Delivery, {
    foreignKey: 'order_id',
    as: 'delivery',
    onDelete: 'CASCADE'
  });
  Order.hasMany(Payment, {
    foreignKey: 'order_id',
    as: 'payments',
    onDelete: 'CASCADE'
  });
  Order.hasMany(UserRating, {
    foreignKey: 'order_id',
    as: 'ratings',
    onDelete: 'CASCADE'
  });
  Order.hasMany(SupportTicket, {
    foreignKey: 'order_id',
    as: 'supportTickets',
    onDelete: 'SET NULL'
  });
  Order.belongsToMany(Product, {
    through: OrderItem,
    foreignKey: 'order_id',
    otherKey: 'product_id',
    as: 'products'
  });
  Order.hasMany(Return, {
    foreignKey: 'order_id',
    as: 'returns',
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

  // Delivery associations
  Delivery.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order'
  });
  Delivery.belongsTo(User, {
    foreignKey: 'courier_id',
    as: 'courier'
  });

  // Payment associations
  Payment.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order'
  });
  Payment.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // UserRating associations
  UserRating.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order'
  });
  UserRating.belongsTo(User, {
    foreignKey: 'rater_id',
    as: 'rater'
  });
  UserRating.belongsTo(User, {
    foreignKey: 'rated_user_id',
    as: 'ratedUser'
  });
  UserRating.belongsTo(Hub, {
    foreignKey: 'hub_id',
    as: 'hub'
  });

  // Notification associations
  Notification.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // AnalyticsEvent associations
  AnalyticsEvent.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // SupportTicket associations
  SupportTicket.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });
  SupportTicket.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order'
  });
  SupportTicket.belongsTo(User, {
    foreignKey: 'assigned_to',
    as: 'assignedUser'
  });

  // AIRecommendation associations
  AIRecommendation.belongsTo(Hub, {
    foreignKey: 'hub_id',
    as: 'hub'
  });
  AIRecommendation.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
  });

  // EmergencyContact associations
  EmergencyContact.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // UserAchievement associations
  UserAchievement.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // Leaderboard associations
  Leaderboard.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // Promotion associations
  Promotion.hasMany(UserPromotionUsage, {
    foreignKey: 'promotion_id',
    as: 'usages',
    onDelete: 'CASCADE'
  });

  // UserPromotionUsage associations
  UserPromotionUsage.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });
  UserPromotionUsage.belongsTo(Promotion, {
    foreignKey: 'promotion_id',
    as: 'promotion'
  });

  // Return associations
  Return.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order'
  });
  Return.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
  });
  Return.belongsTo(User, {
    foreignKey: 'customer_id',
    as: 'customer'
  });
  Return.belongsTo(Hub, {
    foreignKey: 'hub_id',
    as: 'hub'
  });

  // NotificationPreference associations
  NotificationPreference.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // CourierVehicle associations
  CourierVehicle.belongsTo(User, {
    foreignKey: 'courier_id',
    as: 'courier'
  });

  // ProductReview associations
  ProductReview.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
  });
  ProductReview.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
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
  HubInventory,
  Payment,
  UserRating,
  Notification,
  AnalyticsEvent,
  SupportTicket,
  AIRecommendation,
  EmergencyContact,
  UserAchievement,
  Leaderboard,
  Promotion,
  UserPromotionUsage,
  Return,
  NotificationPreference,
  CourierVehicle,
  SystemConfiguration,
  ProductReview,
  AIOptimizationLog,
  syncDatabase
};
