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
    const redisHost = process.env.REDIS_HOST || 'redis';
    const redisPort = process.env.REDIS_PORT || 6379;
    const pubClient = createClient({ url: `redis://${redisHost}:${redisPort}` });
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

      // Community events
      socket.on('join_community_hub', (hubId) => {
        socket.join(`community_hub:${hubId}`);
        logger.info(`👥 User ${socket.userId} joined community hub ${hubId}`);
      });

      socket.on('leave_community_hub', (hubId) => {
        socket.leave(`community_hub:${hubId}`);
        logger.info(`👋 User ${socket.userId} left community hub ${hubId}`);
      });

      socket.on('community_activity', (data) => {
        const { hubId, activityType, activityData } = data;
        
        // Broadcast to community hub members
        this.io.to(`community_hub:${hubId}`).emit('community_update', {
          userId: socket.userId,
          userType: socket.userType,
          activityType,
          activityData,
          timestamp: new Date().toISOString()
        });
        
        logger.info(`🏘️ Community activity in hub ${hubId}: ${activityType}`);
      });

      // Crisis management events
      socket.on('join_crisis_response', (crisisId) => {
        socket.join(`crisis:${crisisId}`);
        logger.info(`🚨 User ${socket.userId} joined crisis response ${crisisId}`);
      });

      socket.on('crisis_volunteer_update', (data) => {
        const { crisisId, volunteerId, status, location } = data;
        
        // Broadcast to crisis response team
        this.io.to(`crisis:${crisisId}`).emit('volunteer_status_update', {
          volunteerId,
          status,
          location,
          timestamp: new Date().toISOString()
        });
        
        logger.info(`👨‍🚒 Volunteer ${volunteerId} status update in crisis ${crisisId}: ${status}`);
      });

      socket.on('emergency_resource_request', (data) => {
        const { crisisId, resourceType, quantity, urgency, location } = data;
        
        // Broadcast to all emergency responders and hub owners
        this.io.to(`crisis:${crisisId}`)
               .to('hubowners')
               .to('admin')
               .emit('resource_request', {
                 requesterId: socket.userId,
                 resourceType,
                 quantity,
                 urgency,
                 location,
                 timestamp: new Date().toISOString()
               });
        
        logger.warn(`🆘 Emergency resource request: ${resourceType} x${quantity} (${urgency})`);
      });

      // Earnings and leaderboard events
      socket.on('subscribe_leaderboard', (leaderboardType) => {
        socket.join(`leaderboard:${leaderboardType}`);
        logger.info(`🏆 User ${socket.userId} subscribed to ${leaderboardType} leaderboard`);
      });

      // Mobile app specific events
      socket.on('location_permission_update', (data) => {
        const { hasPermission, accuracy } = data;
        
        if (socket.userType === 'courier' && hasPermission) {
          // Enable location tracking for courier
          socket.emit('location_tracking_enabled', {
            accuracy,
            timestamp: new Date().toISOString()
          });
        }
        
        logger.info(`📍 Location permission updated for ${socket.userId}: ${hasPermission}`);
      });

      socket.on('app_state_change', (data) => {
        const { state } = data; // foreground, background, inactive
        
        // Update user's online status based on app state
        if (state === 'background' || state === 'inactive') {
          socket.emit('status_update', { online: false });
        } else {
          socket.emit('status_update', { online: true });
        }
        
        logger.info(`📱 App state changed for ${socket.userId}: ${state}`);
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

  // Send notification to specific user
  sendNotificationToUser(userId, notification) {
    // Send to user-specific room
    this.io.to(`customer:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
    
    // Also try other user types in case the user is logged in as different role
    this.io.to(`courier:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
    
    this.io.to(`hubowner:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });

    logger.info(`📲 Notification sent to user ${userId}: ${notification.title}`);
  }

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

  // Community hub notifications
  notifyCommunityHubActivity(hubId, activity) {
    this.io.to(`community_hub:${hubId}`).emit('community_update', {
      ...activity,
      timestamp: new Date().toISOString()
    });
  }

  // Crisis response notifications
  broadcastCrisisUpdate(crisisId, update) {
    this.io.to(`crisis:${crisisId}`).emit('crisis_update', {
      ...update,
      timestamp: new Date().toISOString()
    });
  }

  // Emergency resource notifications
  notifyEmergencyResourceUpdate(resourceUpdate) {
    this.io.to('hubowners')
           .to('admin')
           .emit('emergency_resource_update', {
             ...resourceUpdate,
             timestamp: new Date().toISOString()
           });
  }

  // Leaderboard updates
  broadcastLeaderboardUpdate(leaderboardType, rankings) {
    this.io.to(`leaderboard:${leaderboardType}`).emit('leaderboard_update', {
      leaderboardType,
      rankings,
      timestamp: new Date().toISOString()
    });
  }

  // Earnings notifications
  notifyEarningsUpdate(userId, earningsData) {
    this.io.to(`customer:${userId}`)
           .to(`courier:${userId}`)
           .to(`hubowner:${userId}`)
           .emit('earnings_update', {
             ...earningsData,
             timestamp: new Date().toISOString()
           });
  }

  // Challenge notifications
  broadcastChallengeUpdate(challengeData) {
    this.io.emit('challenge_update', {
      ...challengeData,
      timestamp: new Date().toISOString()
    });
  }

  // Safety report notifications
  notifySafetyReportUpdate(reportData) {
    this.io.to('admin')
           .to('hubowners')
           .emit('safety_report_update', {
             ...reportData,
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

  // Get user's socket ID
  getUserSocketId(userId) {
    return this.connectedUsers.get(userId) || 
           this.connectedCouriers.get(userId) || 
           this.connectedHubOwners.get(userId) || 
           null;
  }
}

// Export singleton instance
module.exports = new SocketManager();
