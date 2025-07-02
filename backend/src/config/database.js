const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

// Load database configuration
const configPath = path.join(__dirname, '..', '..', 'config', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

if (!dbConfig) {
  throw new Error(`Database configuration for environment "${env}" not found.`);
}

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: process.env.NODE_ENV === 'development' ? logger.info : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully');
    
    // Initialize models and associations
    const { syncDatabase } = require('../models');
    await syncDatabase();
    
  } catch (error) {
    logger.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  connectDB,
};
