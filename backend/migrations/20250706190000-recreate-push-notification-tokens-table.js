// Migration to drop and recreate push_notification_tokens table with all required columns
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS push_notification_tokens CASCADE');
    await queryInterface.createTable('push_notification_tokens', {
      token_id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      user_id: { type: Sequelize.UUID, allowNull: false },
      device_token: { type: Sequelize.STRING, allowNull: false },
      device_type: { type: Sequelize.STRING, allowNull: false },
      device_info: { type: Sequelize.JSONB },
      app_version: { type: Sequelize.STRING },
      os_version: { type: Sequelize.STRING },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      notification_preferences: { type: Sequelize.JSONB },
      last_used: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('push_notification_tokens');
  }
};
