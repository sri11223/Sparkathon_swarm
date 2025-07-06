const { sequelize } = require('../src/models');
const { Umzug, SequelizeStorage } = require('umzug');

const umzug = new Umzug({
  migrations: { glob: 'migrations/*.js' },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

const resetDatabase = async () => {
  try {
    console.log('⚠️  DANGER: This will delete ALL data in the database!');
    console.log('🔄 Resetting SwarmFill database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Drop all tables
    await sequelize.drop();
    console.log('✅ All tables dropped');

    // Run all migrations
    await umzug.up();
    console.log('✅ All migrations executed');
    
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
