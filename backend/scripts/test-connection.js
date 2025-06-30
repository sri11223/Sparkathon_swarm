const { sequelize } = require('../src/models');

const testConnection = async () => {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test query execution
    const result = await sequelize.query('SELECT version()', { 
      type: sequelize.QueryTypes.SELECT 
    });
    console.log('✅ Query execution successful');
    console.log(`📊 PostgreSQL version: ${result[0].version}`);
    
    // Test model access
    const { User, Hub, Product, Inventory, Order, OrderItem } = require('../src/models');
    console.log('✅ All models loaded successfully');
    
    // Check table existence
    const tables = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('📋 Database tables:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    console.log('');
    console.log('🎉 Database is ready for use!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('');
    console.error('Troubleshooting checklist:');
    console.error('1. ✓ PostgreSQL service is running');
    console.error('2. ✓ Database credentials in .env are correct');
    console.error('3. ✓ Database "swarmfill_db" exists');
    console.error('4. ✓ User has proper permissions');
    console.error('5. ✓ Firewall allows connection to port 5432');
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

testConnection();
