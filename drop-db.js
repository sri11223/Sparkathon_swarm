const { Client } = require('pg');

const dropDatabase = async () => {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    port: 5432,
  });

  try {
    await client.connect();
    await client.query('DROP DATABASE "swarm-fill-network-development"');
    console.log('Database dropped successfully.');
  } catch (error) {
    console.error('Error dropping database:', error);
  } finally {
    await client.end();
  }
};

dropDatabase();
