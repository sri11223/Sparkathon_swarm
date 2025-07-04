'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Add missing fields to orders table
    
    // Check if courier_id column exists
    const courierIdExists = await queryInterface.describeTable('orders')
      .then(tableDescription => tableDescription.courier_id !== undefined)
      .catch(() => false);
    
    if (!courierIdExists) {
      await queryInterface.addColumn('orders', 'courier_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }

    // Check if delivery_address column exists  
    const deliveryAddressExists = await queryInterface.describeTable('orders')
      .then(tableDescription => tableDescription.delivery_address !== undefined)
      .catch(() => false);
    
    if (!deliveryAddressExists) {
      await queryInterface.addColumn('orders', 'delivery_address', {
        type: Sequelize.TEXT,
        allowNull: true // Temporarily allow null for existing records
      });
    }

    // Check if delivery_latitude column exists
    const deliveryLatExists = await queryInterface.describeTable('orders')
      .then(tableDescription => tableDescription.delivery_latitude !== undefined)
      .catch(() => false);
    
    if (!deliveryLatExists) {
      await queryInterface.addColumn('orders', 'delivery_latitude', {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true // Temporarily allow null for existing records
      });
    }

    // Check if delivery_longitude column exists
    const deliveryLngExists = await queryInterface.describeTable('orders')
      .then(tableDescription => tableDescription.delivery_longitude !== undefined)
      .catch(() => false);
    
    if (!deliveryLngExists) {
      await queryInterface.addColumn('orders', 'delivery_longitude', {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true // Temporarily allow null for existing records
      });
    }

    // Check if courier_notes column exists
    const courierNotesExists = await queryInterface.describeTable('orders')
      .then(tableDescription => tableDescription.courier_notes !== undefined)
      .catch(() => false);
    
    if (!courierNotesExists) {
      await queryInterface.addColumn('orders', 'courier_notes', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    // Check if estimated_delivery_time column exists
    const estimatedDeliveryExists = await queryInterface.describeTable('orders')
      .then(tableDescription => tableDescription.estimated_delivery_time !== undefined)
      .catch(() => false);
    
    if (!estimatedDeliveryExists) {
      await queryInterface.addColumn('orders', 'estimated_delivery_time', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    // Check if cancellation_reason column exists
    const cancellationReasonExists = await queryInterface.describeTable('orders')
      .then(tableDescription => tableDescription.cancellation_reason !== undefined)
      .catch(() => false);
    
    if (!cancellationReasonExists) {
      await queryInterface.addColumn('orders', 'cancellation_reason', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    // Update the status enum to include new values
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'status') THEN
          ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
          ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'ready_for_pickup', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'failed'));
        END IF;
      END $$;
    `);
  },

  async down (queryInterface, Sequelize) {
    // Remove the added columns
    const tableDescription = await queryInterface.describeTable('orders');
    
    if (tableDescription.courier_id) {
      await queryInterface.removeColumn('orders', 'courier_id');
    }
    
    if (tableDescription.delivery_address) {
      await queryInterface.removeColumn('orders', 'delivery_address');
    }
    
    if (tableDescription.delivery_latitude) {
      await queryInterface.removeColumn('orders', 'delivery_latitude');
    }
    
    if (tableDescription.delivery_longitude) {
      await queryInterface.removeColumn('orders', 'delivery_longitude');
    }
    
    if (tableDescription.courier_notes) {
      await queryInterface.removeColumn('orders', 'courier_notes');
    }
    
    if (tableDescription.estimated_delivery_time) {
      await queryInterface.removeColumn('orders', 'estimated_delivery_time');
    }
    
    if (tableDescription.cancellation_reason) {
      await queryInterface.removeColumn('orders', 'cancellation_reason');
    }

    // Restore original status constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
      ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'ready_for_pickup', 'out_for_delivery', 'completed', 'cancelled'));
    `);
  }
};
