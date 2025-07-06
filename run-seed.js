require('dotenv').config({ path: './backend/.env' });
const { seedDatabase } = require('./database/seeds/01-sample-data.js');
const { sequelize } = require('./backend/src/config/database');

const run = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synchronized.');
    await seedDatabase();
    console.log('Seeding complete.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await sequelize.close();
  }
};

run();
