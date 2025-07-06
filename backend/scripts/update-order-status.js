const { sequelize } = require('../src/models');

async function updateOrderStatus() {
  try {
    await sequelize.query(`
      UPDATE orders
      SET status = 
        CASE
          WHEN status = 'out_for_delivery' THEN 'in_transit'
          WHEN status = 'completed' THEN 'delivered'
          ELSE status
        END
      WHERE status IN ('out_for_delivery', 'completed');
    `);
    console.log('Order statuses updated successfully.');
  } catch (error) {
    console.error('Error updating order statuses:', error);
  } finally {
    await sequelize.close();
  }
}

updateOrderStatus();
