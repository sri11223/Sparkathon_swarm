const { sequelize } = require('../src/models');

async function createMetaTable() {
  try {
    await sequelize.getQueryInterface().createTable('SequelizeMeta', {
      name: {
        type: sequelize.Sequelize.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
    });
    console.log('SequelizeMeta table created successfully.');
  } catch (error) {
    console.error('Error creating SequelizeMeta table:', error);
  } finally {
    await sequelize.close();
  }
}

createMetaTable();
