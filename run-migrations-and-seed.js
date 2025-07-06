require('dotenv').config({ path: './backend/.env' });
const { sequelize } = require('./backend/src/config/database');
const { Umzug, SequelizeStorage } = require('umzug');
const { seedDatabase } = require('./database/seeds/01-sample-data.js');

const umzug = new Umzug({
  migrations: { glob: './backend/migrations/*.js' },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    await umzug.up();
    console.log('Migrations executed.');
    await seedDatabase();
    console.log('Seeding complete.');
  } catch (error) {
    console.error('Migration or seeding failed:', error);
  } finally {
    await sequelize.close();
  }
};

run();
