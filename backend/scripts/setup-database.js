const { sequelize, syncDatabase } = require('../src/models');
const logger = require('../src/utils/logger');

const setupDatabase = async () => {
  try {
    console.log('🔧 Setting up SwarmFill database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync all models
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database models synchronized');
    
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npm run db:seed (to add sample data)');
    console.log('2. Run: npm run dev (to start the server)');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Make sure PostgreSQL is running');
    console.error('2. Check your .env database credentials');
    console.error('3. Ensure the database exists');
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

setupDatabase();
