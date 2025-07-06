const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');
require('dotenv').config();

// PostgreSQL configuration using Docker credentials
const dbName = process.env.DB_NAME || 'swarmfill_db';
const dbUser = process.env.DB_USER || 'swarmfill_user';
const dbPassword = process.env.DB_PASSWORD || 'swarmfill123';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 5432;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: false,
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
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully');
  } catch (error) {
    logger.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  connectDB
};
