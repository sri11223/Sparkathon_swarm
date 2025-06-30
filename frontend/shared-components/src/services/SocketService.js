import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.userInfo = null;
    this.eventCallbacks = new Map();
  }

  // Initialize connection
  connect(serverUrl = 'http://localhost:3000', userInfo = null) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.userInfo = userInfo;
    this.setupEventHandlers();
    
    if (userInfo) {
      this.authenticate(userInfo);
    }

    return this.socket;
  }

  // Setup basic event handlers
  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('🔌 Connected to server:', this.socket.id);
      this.isConnected = true;
      this.triggerCallback('connected', { socketId: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from server:', reason);
      this.isConnected = false;
      this.triggerCallback('disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
      this.triggerCallback('connection_error', { error });
    });

    this.socket.on('authenticated', (data) => {
      console.log('✅ Authenticated:', data);
      this.triggerCallback('authenticated', data);
    });

    // Order tracking events
    this.socket.on('order_update', (data) => {
      console.log('📦 Order update:', data);
      this.triggerCallback('order_update', data);
    });

    this.socket.on('courier_location', (data) => {
      console.log('📍 Courier location:', data);
      this.triggerCallback('courier_location', data);
    });

    // Hub events
    this.socket.on('hub_inventory_changed', (data) => {
      console.log('🏪 Hub inventory changed:', data);
      this.triggerCallback('hub_inventory_changed', data);
    });

    this.socket.on('new_order_notification', (data) => {
      console.log('🆕 New order notification:', data);
      this.triggerCallback('new_order_notification', data);
    });

    // Courier events
    this.socket.on('delivery_opportunity', (data) => {
      console.log('🚚 Delivery opportunity:', data);
      this.triggerCallback('delivery_opportunity', data);
    });

    this.socket.on('delivery_assigned', (data) => {
      console.log('🚚 Delivery assigned:', data);
      this.triggerCallback('delivery_assigned', data);
    });

    // Messaging
    this.socket.on('new_message', (data) => {
      console.log('💬 New message:', data);
      this.triggerCallback('new_message', data);
    });

    // System notifications
    this.socket.on('system_notification', (data) => {
      console.log('🔔 System notification:', data);
      this.triggerCallback('system_notification', data);
    });

    this.socket.on('emergency_notification', (data) => {
      console.log('🚨 Emergency notification:', data);
      this.triggerCallback('emergency_notification', data);
    });

    // Inventory alerts
    this.socket.on('low_inventory_alert', (data) => {
      console.log('⚠️ Low inventory alert:', data);
      this.triggerCallback('low_inventory_alert', data);
    });
  }

  // Authenticate user
  authenticate(userInfo) {
    if (this.socket && userInfo) {
      this.socket.emit('authenticate', {
        userId: userInfo.userId,
        userType: userInfo.userType, // 'customer', 'courier', 'hubowner', 'admin'
        token: userInfo.token
      });
    }
  }

  // Order tracking
  trackOrder(orderId) {
    if (this.socket) {
      this.socket.emit('track_order', orderId);
    }
  }

  // Courier location updates
  updateCourierLocation(latitude, longitude, orderId = null) {
    if (this.socket) {
      this.socket.emit('courier_location_update', {
        latitude,
        longitude,
        orderId
      });
    }
  }

  // Hub inventory updates
  updateHubInventory(hubId, productId, quantity, action) {
    if (this.socket) {
      this.socket.emit('hub_inventory_update', {
        hubId,
        productId,
        quantity,
        action // 'add', 'remove', 'update'
      });
    }
  }

  // Create new order
  createNewOrder(orderData) {
    if (this.socket) {
      this.socket.emit('new_order', orderData);
    }
  }

  // Send message
  sendMessage(recipientId, message, messageType = 'text', orderId = null) {
    if (this.socket) {
      this.socket.emit('send_message', {
        recipientId,
        message,
        messageType,
        orderId
      });
    }
  }

  // Send emergency alert (admin/hubowner only)
  sendEmergencyAlert(alertData) {
    if (this.socket) {
      this.socket.emit('emergency_alert', alertData);
    }
  }

  // Event subscription
  on(eventName, callback) {
    if (!this.eventCallbacks.has(eventName)) {
      this.eventCallbacks.set(eventName, []);
    }
    this.eventCallbacks.get(eventName).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.eventCallbacks.get(eventName);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Trigger callbacks
  triggerCallback(eventName, data) {
    const callbacks = this.eventCallbacks.get(eventName);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${eventName} callback:`, error);
        }
      });
    }
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.userInfo = null;
    }
  }

  // Check connection status
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  // Get socket ID
  getSocketId() {
    return this.socket ? this.socket.id : null;
  }
}

// Export singleton instance
export default new SocketService();
