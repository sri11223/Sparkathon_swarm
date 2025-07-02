const { Server } = require('socket.io');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');
const logger = require('../utils/logger');

class SocketManager {
  constructor() {
    this.io = null;
    // The connectedUsers maps are now less critical for messaging but still useful for tracking.
    this.connectedUsers = new Map();
    this.connectedCouriers = new Map();
    this.connectedHubOwners = new Map();
  }

  async initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URLS?.split(',') || [
          'http://localhost:3000', 
          'http://localhost:19006',
          'http://localhost:8081'
        ],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    // --- REDIS CONFIGURATION ---
    logger.info('🔌 Attempting to connect to Redis for Socket.IO adapter...');
    const pubClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);
    logger.info('✅ Redis clients connected successfully.');

    this.io.adapter(createAdapter(pubClient, subClient));
    logger.info('✅ Socket.IO Redis adapter configured.');
    // --- END REDIS CONFIGURATION ---

    this.setupEventHandlers();
    logger.info('🔌 Socket.IO initialized successfully');
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`📱 New socket connection: ${socket.id}`);

      // User authentication and role assignment
      socket.on('authenticate', (data) => {
        const { userId, userType, token } = data;
        
        // TODO: Verify JWT token here
        // For now, we'll accept the authentication
        
        socket.userId = userId;
        socket.userType = userType; // 'customer', 'courier', 'hubowner', 'admin'
        
        // Store connection based on user type
        switch (userType) {
          case 'customer':
            this.connectedUsers.set(userId, socket.id);
            socket.join(`customer:${userId}`);
            break;
          case 'courier':
            this.connectedCouriers.set(userId, socket.id);
            socket.join(`courier:${userId}`);
            socket.join('couriers'); // All couriers room
            break;
          case 'hubowner':
            this.connectedHubOwners.set(userId, socket.id);
            socket.join(`hubowner:${userId}`);
            socket.join('hubowners'); // All hub owners room
            break;
          case 'admin':
            socket.join('admin');
            break;
        }

        logger.info(`👤 User authenticated: ${userId} (${userType})`);
        socket.emit('authenticated', { success: true, userId, userType });
      });

      // Order tracking events
      socket.on('track_order', (orderId) => {
        socket.join(`order:${orderId}`);
        logger.info(`📦 Socket ${socket.id} tracking order: ${orderId}`);
      });

      // Courier location updates
      socket.on('courier_location_update', (data) => {
        if (socket.userType === 'courier') {
          const { latitude, longitude, orderId } = data;
          
          // Broadcast location to customers tracking this courier
          if (orderId) {
            this.io.to(`order:${orderId}`).emit('courier_location', {
              courierId: socket.userId,
              latitude,
              longitude,
              timestamp: new Date().toISOString()
            });
          }
          
          logger.info(`📍 Courier ${socket.userId} location updated`);
        }
      });

      // Hub inventory updates
      socket.on('hub_inventory_update', (data) => {
        if (socket.userType === 'hubowner') {
          const { hubId, productId, quantity, action } = data;
          
          // Broadcast to customers in the area
          this.io.emit('hub_inventory_changed', {
            hubId,
            productId,
            quantity,
            action, // 'add', 'remove', 'update'
            timestamp: new Date().toISOString()
          });
          
          logger.info(`🏪 Hub ${hubId} inventory updated by ${socket.userId}`);
        }
      });

      // New order notifications
      socket.on('new_order', (orderData) => {
        const { hubId, courierId, customerId } = orderData;
        
        // Notify hub owner
        if (hubId) {
          this.io.to(`hubowner:${hubId}`).emit('new_order_notification', {
            ...orderData,
            type: 'new_order',
            timestamp: new Date().toISOString()
          });
        }
        
        // Notify available couriers in the area
        this.io.to('couriers').emit('delivery_opportunity', {
          ...orderData,
          type: 'delivery_available',
          timestamp: new Date().toISOString()
        });
        
        logger.info(`🆕 New order broadcasted: ${orderData.orderId}`);
      });

      // Chat/messaging system
      socket.on('send_message', (data) => {
        const { recipientId, message, messageType, orderId } = data;
        
        // Send message to specific user or order participants
        if (recipientId) {
          this.io.to(`customer:${recipientId}`)
               .to(`courier:${recipientId}`)
               .to(`hubowner:${recipientId}`)
               .emit('new_message', {
                 senderId: socket.userId,
                 message,
                 messageType,
                 orderId,
                 timestamp: new Date().toISOString()
               });
        } else if (orderId) {
          // Broadcast to all participants of an order
          this.io.to(`order:${orderId}`).emit('new_message', {
            senderId: socket.userId,
            message,
            messageType,
            orderId,
            timestamp: new Date().toISOString()
          });
        }
        
        logger.info(`💬 Message sent from ${socket.userId}`);
      });

      // Emergency alerts
      socket.on('emergency_alert', (data) => {
        if (socket.userType === 'admin' || socket.userType === 'hubowner') {
          // Broadcast emergency to all users in affected area
          this.io.emit('emergency_notification', {
            ...data,
            type: 'emergency',
            senderId: socket.userId,
            timestamp: new Date().toISOString()
          });
          
          logger.warn(`🚨 Emergency alert broadcasted by ${socket.userId}`);
        }
      });

      // Disconnect handling
      socket.on('disconnect', () => {
        // Remove from tracking maps
        if (socket.userId && socket.userType) {
          switch (socket.userType) {
            case 'customer':
              this.connectedUsers.delete(socket.userId);
              break;
            case 'courier':
              this.connectedCouriers.delete(socket.userId);
              break;
            case 'hubowner':
              this.connectedHubOwners.delete(socket.userId);
              break;
          }
        }
        
        logger.info(`📱 Socket disconnected: ${socket.id}`);
      });

      // Error handling
      socket.on('error', (error) => {
        logger.error(`🔌 Socket error from ${socket.id}:`, error);
      });
    });
  }

  // Helper methods for broadcasting from other parts of the application

  // Notify customer about order status change
  notifyOrderUpdate(customerId, orderData) {
    this.io.to(`customer:${customerId}`).emit('order_update', {
      ...orderData,
      timestamp: new Date().toISOString()
    });
  }

  // Notify courier about new delivery assignment
  notifyCourierAssignment(courierId, deliveryData) {
    this.io.to(`courier:${courierId}`).emit('delivery_assigned', {
      ...deliveryData,
      timestamp: new Date().toISOString()
    });
  }

  // Notify hub owner about low inventory
  notifyLowInventory(hubOwnerId, inventoryData) {
    this.io.to(`hubowner:${hubOwnerId}`).emit('low_inventory_alert', {
      ...inventoryData,
      type: 'low_inventory',
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast system-wide notifications
  broadcastSystemNotification(notification) {
    this.io.emit('system_notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  // Get connection statistics
  getConnectionStats() {
    return {
      totalConnections: this.io.engine.clientsCount,
      customers: this.connectedUsers.size,
      couriers: this.connectedCouriers.size,
      hubOwners: this.connectedHubOwners.size
    };
  }
}

// Export singleton instance
module.exports = new SocketManager();
