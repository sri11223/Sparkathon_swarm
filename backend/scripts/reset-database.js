const { sequelize } = require('../src/models');

const resetDatabase = async () => {
  try {
    console.log('⚠️  DANGER: This will delete ALL data in the database!');
    console.log('🔄 Resetting SwarmFill database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Drop and recreate all tables
    await sequelize.sync({ force: true });
    console.log('✅ All tables dropped and recreated');
    
    console.log('🎉 Database reset completed!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npm run db:seed (to add sample data)');
    console.log('2. Run: npm run dev (to start the server)');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

resetDatabase();
