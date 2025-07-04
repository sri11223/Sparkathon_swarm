'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Add missing fields to products table
    
    // Check if category column exists
    const categoryExists = await queryInterface.describeTable('products')
      .then(tableDescription => tableDescription.category !== undefined)
      .catch(() => false);
    
    if (!categoryExists) {
      await queryInterface.addColumn('products', 'category', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
    }

    // Check if base_price column exists  
    const basePriceExists = await queryInterface.describeTable('products')
      .then(tableDescription => tableDescription.base_price !== undefined)
      .catch(() => false);
    
    if (!basePriceExists) {
      await queryInterface.addColumn('products', 'base_price', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      });
    }

    // Check if is_active column exists
    const isActiveExists = await queryInterface.describeTable('products')
      .then(tableDescription => tableDescription.is_active !== undefined)
      .catch(() => false);
    
    if (!isActiveExists) {
      await queryInterface.addColumn('products', 'is_active', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      });
    }

    // Update base_price to match price for existing products
    await queryInterface.sequelize.query(
      'UPDATE products SET base_price = price WHERE base_price = 0 OR base_price IS NULL'
    );
  },

  async down (queryInterface, Sequelize) {
    // Remove the added columns
    const tableDescription = await queryInterface.describeTable('products');
    
    if (tableDescription.category) {
      await queryInterface.removeColumn('products', 'category');
    }
    
    if (tableDescription.base_price) {
      await queryInterface.removeColumn('products', 'base_price');
    }
    
    if (tableDescription.is_active) {
      await queryInterface.removeColumn('products', 'is_active');
    }
  }
};
