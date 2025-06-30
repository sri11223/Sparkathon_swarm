import { useState, useEffect, useRef, useCallback } from 'react';
import SocketService from '../services/SocketService';

/**
 * Custom React hook for WebSocket communication
 * Handles connection, authentication, and event management
 * 
 * @param {string} serverUrl - WebSocket server URL
 * @param {Object} userInfo - User authentication info { userId, userType, token }
 * @param {boolean} autoConnect - Whether to connect automatically
 * @returns {Object} Socket state and functions
 */
export const useSocket = (serverUrl = 'http://localhost:3000', userInfo = null, autoConnect = true) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [socketId, setSocketId] = useState(null);
  
  const eventListenersRef = useRef(new Map());
  const socketServiceRef = useRef(SocketService);

  // Connect to WebSocket
  const connect = useCallback((customUserInfo = null) => {
    const authInfo = customUserInfo || userInfo;
    
    try {
      socketServiceRef.current.connect(serverUrl, authInfo);
      setConnectionError(null);
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setConnectionError(error.message);
    }
  }, [serverUrl, userInfo]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    socketServiceRef.current.disconnect();
    setIsConnected(false);
    setIsAuthenticated(false);
    setSocketId(null);
  }, []);

  // Subscribe to socket events
  const on = useCallback((eventName, callback) => {
    const unsubscribe = socketServiceRef.current.on(eventName, callback);
    
    // Store unsubscribe function for cleanup
    if (!eventListenersRef.current.has(eventName)) {
      eventListenersRef.current.set(eventName, []);
    }
    eventListenersRef.current.get(eventName).push(unsubscribe);
    
    return unsubscribe;
  }, []);

  // Send data to server
  const emit = useCallback((eventName, data) => {
    if (socketServiceRef.current.isSocketConnected()) {
      socketServiceRef.current.socket.emit(eventName, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', eventName);
    }
  }, []);

  // Track order
  const trackOrder = useCallback((orderId) => {
    socketServiceRef.current.trackOrder(orderId);
  }, []);

  // Update courier location
  const updateLocation = useCallback((latitude, longitude, orderId = null) => {
    socketServiceRef.current.updateCourierLocation(latitude, longitude, orderId);
  }, []);

  // Update hub inventory
  const updateInventory = useCallback((hubId, productId, quantity, action) => {
    socketServiceRef.current.updateHubInventory(hubId, productId, quantity, action);
  }, []);

  // Send message
  const sendMessage = useCallback((recipientId, message, messageType = 'text', orderId = null) => {
    socketServiceRef.current.sendMessage(recipientId, message, messageType, orderId);
  }, []);

  // Send emergency alert
  const sendEmergencyAlert = useCallback((alertData) => {
    socketServiceRef.current.sendEmergencyAlert(alertData);
  }, []);

  // Setup event listeners for connection state
  useEffect(() => {
    const setupListeners = () => {
      // Connection events
      const unsubscribeConnected = on('connected', (data) => {
        setIsConnected(true);
        setSocketId(data.socketId);
        setConnectionError(null);
      });

      const unsubscribeDisconnected = on('disconnected', () => {
        setIsConnected(false);
        setIsAuthenticated(false);
        setSocketId(null);
      });

      const unsubscribeConnectionError = on('connection_error', (data) => {
        setConnectionError(data.error?.message || 'Connection error');
        setIsConnected(false);
      });

      const unsubscribeAuthenticated = on('authenticated', () => {
        setIsAuthenticated(true);
      });

      return () => {
        unsubscribeConnected();
        unsubscribeDisconnected();
        unsubscribeConnectionError();
        unsubscribeAuthenticated();
      };
    };

    const cleanup = setupListeners();

    // Auto-connect if enabled
    if (autoConnect && userInfo) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      cleanup();
      
      // Clean up all event listeners
      eventListenersRef.current.forEach((unsubscribers) => {
        unsubscribers.forEach(unsubscribe => unsubscribe());
      });
      eventListenersRef.current.clear();
      
      if (autoConnect) {
        disconnect();
      }
    };
  }, [connect, disconnect, on, autoConnect, userInfo]);

  return {
    // Connection state
    isConnected,
    isAuthenticated,
    connectionError,
    socketId,
    
    // Connection methods
    connect,
    disconnect,
    
    // Event methods
    on,
    emit,
    
    // Specific feature methods
    trackOrder,
    updateLocation,
    updateInventory,
    sendMessage,
    sendEmergencyAlert,
    
    // Direct socket access (use carefully)
    socket: socketServiceRef.current
  };
};

export default useSocket;
