# WebSocket Integration for Real-Time Communication

## Overview

The SwarmFill Network uses WebSocket connections for real-time communication between:
- **Customers** and **Hub Owners** (order notifications, inventory updates)
- **Customers** and **Couriers** (delivery tracking, location updates)
- **Hub Owners** and **Couriers** (delivery assignments, pickup notifications)
- **Admin** and all users (system notifications, emergency alerts)

## Backend WebSocket Server

### Features Implemented:
- ✅ User authentication and role-based rooms
- ✅ Real-time order tracking and updates
- ✅ Courier location broadcasting
- ✅ Hub inventory change notifications
- ✅ In-app messaging system
- ✅ Emergency alert system
- ✅ Connection management and statistics

### Key Events:

#### **Authentication**
```javascript
socket.emit('authenticate', {
  userId: 'user123',
  userType: 'customer', // 'customer', 'courier', 'hubowner', 'admin'
  token: 'jwt_token_here'
});
```

#### **Order Tracking**
```javascript
// Track an order
socket.emit('track_order', 'order123');

// Listen for order updates
socket.on('order_update', (data) => {
  console.log('Order status changed:', data);
});
```

#### **Courier Location Updates**
```javascript
// Courier sends location
socket.emit('courier_location_update', {
  latitude: 40.7128,
  longitude: -74.0060,
  orderId: 'order123'
});

// Customer receives location
socket.on('courier_location', (data) => {
  console.log('Courier is at:', data.latitude, data.longitude);
});
```

#### **Hub Inventory Changes**
```javascript
// Hub owner updates inventory
socket.emit('hub_inventory_update', {
  hubId: 'hub123',
  productId: 'product456',
  quantity: 50,
  action: 'update'
});

// Customers receive inventory updates
socket.on('hub_inventory_changed', (data) => {
  console.log('Product availability changed:', data);
});
```

## Frontend Integration

### Using the Custom Hook (Recommended)

```jsx
import React, { useEffect, useState } from 'react';
import { useSocket } from '@swarmfill/shared-components';

const CustomerApp = () => {
  const [user] = useState({
    userId: 'customer123',
    userType: 'customer',
    token: 'jwt_token_here'
  });

  const {
    isConnected,
    isAuthenticated,
    connectionError,
    trackOrder,
    sendMessage,
    on
  } = useSocket('http://localhost:3000', user);

  useEffect(() => {
    if (isAuthenticated) {
      // Listen for order updates
      const unsubscribe = on('order_update', (orderData) => {
        console.log('Order updated:', orderData);
        // Update UI with order status
      });

      // Listen for courier location
      on('courier_location', (locationData) => {
        console.log('Courier location:', locationData);
        // Update map with courier position
      });

      return unsubscribe;
    }
  }, [isAuthenticated, on]);

  const handleTrackOrder = (orderId) => {
    trackOrder(orderId);
  };

  return (
    <View>
      <Text>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</Text>
      {connectionError && <Text style={{color: 'red'}}>Error: {connectionError}</Text>}
      {/* Your app UI */}
    </View>
  );
};
```

### Using SocketService Directly

```javascript
import { SocketService } from '@swarmfill/shared-components';

// Connect
SocketService.connect('http://localhost:3000', {
  userId: 'user123',
  userType: 'courier',
  token: 'jwt_token'
});

// Listen for events
SocketService.on('delivery_opportunity', (delivery) => {
  console.log('New delivery opportunity:', delivery);
});

// Send location updates
SocketService.updateCourierLocation(40.7128, -74.0060, 'order123');

// Disconnect when done
SocketService.disconnect();
```

## Mobile App Implementations

### Customer Mobile App WebSocket Features:
- ✅ Real-time order status updates
- ✅ Courier location tracking on map
- ✅ Hub inventory availability notifications
- ✅ In-app messaging with couriers/hub owners
- ✅ System notifications and alerts

### Hub Owner Mobile App WebSocket Features:
- ✅ New order notifications
- ✅ Real-time inventory management
- ✅ Courier pickup notifications
- ✅ Customer messaging
- ✅ Low inventory alerts

### Courier Mobile App WebSocket Features:
- ✅ Delivery opportunity notifications
- ✅ Real-time location broadcasting
- ✅ Order assignment updates
- ✅ Customer/hub owner communication
- ✅ Navigation and route updates

### Admin Web Dashboard WebSocket Features:
- ✅ System-wide monitoring
- ✅ Emergency alert broadcasting
- ✅ Real-time user activity
- ✅ Performance metrics updates

## Event Types and Data Structures

### Order Events
```javascript
// order_update
{
  orderId: 'order123',
  status: 'picked_up', // 'pending', 'confirmed', 'picked_up', 'in_transit', 'delivered'
  customerId: 'customer123',
  courierId: 'courier456',
  hubId: 'hub789',
  estimatedDelivery: '2025-01-22T15:30:00Z',
  timestamp: '2025-01-22T14:15:00Z'
}

// new_order_notification
{
  orderId: 'order123',
  customerId: 'customer123',
  hubId: 'hub789',
  items: [...],
  totalAmount: 45.50,
  pickupAddress: '123 Main St',
  deliveryAddress: '456 Oak Ave',
  timestamp: '2025-01-22T14:00:00Z'
}
```

### Location Events
```javascript
// courier_location
{
  courierId: 'courier456',
  latitude: 40.7128,
  longitude: -74.0060,
  orderId: 'order123',
  accuracy: 10, // meters
  timestamp: '2025-01-22T14:15:00Z'
}
```

### Inventory Events
```javascript
// hub_inventory_changed
{
  hubId: 'hub789',
  productId: 'product456',
  productName: 'Milk 1L',
  quantity: 25,
  action: 'update', // 'add', 'remove', 'update'
  previousQuantity: 30,
  timestamp: '2025-01-22T14:10:00Z'
}

// low_inventory_alert
{
  hubId: 'hub789',
  productId: 'product456',
  productName: 'Milk 1L',
  currentQuantity: 5,
  thresholdQuantity: 10,
  severity: 'warning', // 'warning', 'critical'
  timestamp: '2025-01-22T14:20:00Z'
}
```

### Message Events
```javascript
// new_message
{
  senderId: 'user123',
  senderType: 'customer',
  message: 'Where is my order?',
  messageType: 'text', // 'text', 'image', 'location'
  orderId: 'order123', // optional
  timestamp: '2025-01-22T14:25:00Z'
}
```

### System Events
```javascript
// system_notification
{
  type: 'maintenance', // 'maintenance', 'update', 'promotion'
  title: 'System Maintenance',
  message: 'The system will be down for maintenance from 2-4 AM',
  severity: 'info', // 'info', 'warning', 'error'
  actionRequired: false,
  timestamp: '2025-01-22T14:30:00Z'
}

// emergency_notification
{
  type: 'emergency',
  title: 'Severe Weather Alert',
  message: 'Heavy snow expected. Deliveries may be delayed.',
  affectedAreas: ['downtown', 'westside'],
  severity: 'warning',
  actionRequired: true,
  timestamp: '2025-01-22T14:35:00Z'
}
```

## Testing WebSocket Integration

### Development Testing
```bash
# Start backend with WebSocket
cd backend && npm run dev

# Test WebSocket connection
curl -X GET http://localhost:3000/health
# Should show socketConnections in response

# Use a WebSocket testing tool like:
# - Postman (WebSocket requests)
# - wscat: npm install -g wscat
# - Browser dev tools
```

### Integration Testing
```javascript
// Jest test example
import SocketService from '../services/SocketService';

describe('WebSocket Integration', () => {
  beforeEach(() => {
    SocketService.connect('ws://localhost:3000', {
      userId: 'test_user',
      userType: 'customer',
      token: 'test_token'
    });
  });

  afterEach(() => {
    SocketService.disconnect();
  });

  test('should connect and authenticate', (done) => {
    SocketService.on('authenticated', (data) => {
      expect(data.success).toBe(true);
      done();
    });
  });

  test('should receive order updates', (done) => {
    SocketService.on('order_update', (data) => {
      expect(data.orderId).toBeDefined();
      done();
    });
    
    SocketService.trackOrder('test_order_123');
  });
});
```

## Next Steps for Development

1. **Install Socket.IO Client**: `npm install socket.io-client` in all frontend apps
2. **Implement in Mobile Apps**: Use the `useSocket` hook in your React Native screens
3. **Real-time UI Updates**: Connect WebSocket events to your app's state management
4. **Location Services**: Integrate with React Native Location for courier tracking
5. **Push Notifications**: Combine WebSocket with expo-notifications for background alerts
6. **Error Handling**: Implement reconnection logic and offline state management

This WebSocket system provides the real-time foundation needed for your SwarmFill Network's live tracking, instant notifications, and seamless communication between all user types!
