'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // First, check if 'hub_inventory' table exists and drop it
    const hubInventoryExists = await queryInterface.tableExists('hub_inventory');
    if (hubInventoryExists) {
      console.log('Dropping existing hub_inventory table...');
      await queryInterface.dropTable('hub_inventory');
    }
    
    // Check if inventory table exists and drop it to recreate with correct structure
    const inventoryExists = await queryInterface.tableExists('inventory');
    if (inventoryExists) {
      console.log('Dropping existing inventory table to recreate with correct structure...');
      await queryInterface.dropTable('inventory');
    }
    
    console.log('Creating inventory table with proper structure...');
    // Create inventory table with proper structure
    await queryInterface.createTable('inventory', {
        inventory_id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        hub_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'hubs',
            key: 'hub_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        product_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'products',
            key: 'product_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        reserved_quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
        },
        cost_price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true
        },
        expiry_date: {
          type: Sequelize.DATEONLY,
          allowNull: true
        },
        batch_number: {
          type: Sequelize.STRING(50),
          allowNull: true
        },
        low_stock_threshold: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 10
        },
        location_in_hub: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        supplier_info: {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: {}
        },
        last_restocked: {
          type: Sequelize.DATE,
          allowNull: true
        },
        is_available: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });

      // Add indexes (with error handling in case they exist)
      try {
        await queryInterface.addIndex('inventory', ['hub_id', 'product_id'], {
          unique: true,
          name: 'idx_inventory_hub_product'
        });
      } catch (error) {
        console.log('Index idx_inventory_hub_product already exists, skipping...');
      }

      try {
        await queryInterface.addIndex('inventory', ['quantity', 'low_stock_threshold'], {
          name: 'idx_inventory_low_stock'
        });
      } catch (error) {
        console.log('Index idx_inventory_low_stock already exists, skipping...');
      }

      try {
        await queryInterface.addIndex('inventory', ['expiry_date'], {
          name: 'idx_inventory_expiry'
        });
      } catch (error) {
        console.log('Index idx_inventory_expiry already exists, skipping...');
      }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('inventory');
  }
};
