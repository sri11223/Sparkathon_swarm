require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');

const cleanDatabase = async () => {
  const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    console.log('Database connection successful.');
    const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> 'spatial_ref_sys'");
    for (const row of tables.rows) {
      await client.query(`DROP TABLE IF EXISTS ${row.tablename} CASCADE`);
    }
    console.log('All tables dropped successfully.');
  } catch (error) {
    console.error('Error dropping tables:', error.message);
  } finally {
    await client.end();
  }
};

cleanDatabase();