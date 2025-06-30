const { sequelize } = require('../src/models');
const { seedDatabase } = require('../../database/seeds/01-sample-data');

const runSeeds = async () => {
  try {
    console.log('🌱 Seeding SwarmFill database with sample data...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Run seeding
    await seedDatabase();
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

runSeeds();
