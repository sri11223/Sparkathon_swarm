const { sequelize } = require('../config/database');

// Import all models
const User = require('./User')(sequelize);
const Hub = require('./Hub')(sequelize);
const Product = require('./Product')(sequelize);
const Inventory = require('./Inventory')(sequelize);
const Order = require('./Order')(sequelize);
const OrderItem = require('./OrderItem')(sequelize);

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
    foreignKey: 'source_hub_id', 
    as: 'sourceOrders',
    onDelete: 'SET NULL' 
  });
  Hub.hasMany(Order, { 
    foreignKey: 'destination_hub_id', 
    as: 'destinationOrders',
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
    foreignKey: 'source_hub_id', 
    as: 'sourceHub' 
  });
  Order.belongsTo(Hub, { 
    foreignKey: 'destination_hub_id', 
    as: 'destinationHub' 
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
  syncDatabase
};
