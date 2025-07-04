#!/usr/bin/env node

/**
 * 🗄️ Database Migration Runner
 * 
 * Runs all migration files in order
 */

const fs = require('fs');
const path = require('path');
const { connectDB } = require('../src/config/database');
const logger = require('../src/utils/logger');

async function runMigrations() {
  try {
    // Connect to database
    await connectDB();
    logger.info('Connected to database for migrations');

    const migrationsDir = path.join(__dirname, '..', 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      logger.info('No migrations directory found');
      return;
    }

    // Get all migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort(); // Ensure they run in order

    if (migrationFiles.length === 0) {
      logger.info('No migration files found');
      return;
    }

    logger.info(`Found ${migrationFiles.length} migration files`);

    // Run each migration
    for (const file of migrationFiles) {
      try {
        logger.info(`Running migration: ${file}`);
        
        const migrationPath = path.join(migrationsDir, file);
        const migration = require(migrationPath);
        
        if (migration.up && typeof migration.up === 'function') {
          // Import Sequelize and get QueryInterface
          const { Sequelize } = require('sequelize');
          const { sequelize } = require('../src/models');
          
          await migration.up(sequelize.getQueryInterface(), Sequelize);
          logger.info(`✅ Migration ${file} completed successfully`);
        } else {
          logger.warn(`⚠️ Migration ${file} has no 'up' function`);
        }
      } catch (error) {
        logger.error(`❌ Migration ${file} failed:`, error);
        throw error;
      }
    }

    logger.info('🎉 All migrations completed successfully');

  } catch (error) {
    logger.error('Migration process failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
