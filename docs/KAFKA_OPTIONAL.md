# Kafka Integration (Optional Enhancement)

## Installation
```bash
# Add Kafka client to backend
cd backend && npm install kafkajs

# Docker Kafka setup
# Add to docker-compose.yml
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

  kafka:
    image: confluentinc/cp-kafka:latest
    depends_on:
      - zookeeper
    ports:
      - 9092:9092
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
```

## Basic Kafka Service
```javascript
// backend/src/services/kafkaService.js
const { Kafka } = require('kafkajs');

class KafkaService {
  constructor() {
    this.kafka = Kafka({
      clientId: 'swarmfill-app',
      brokers: ['localhost:9092']
    });
    
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'swarmfill-group' });
  }

  async publishOrderEvent(eventType, orderData) {
    await this.producer.send({
      topic: 'order-events',
      messages: [{
        key: orderData.orderId,
        value: JSON.stringify({
          type: eventType,
          timestamp: Date.now(),
          data: orderData
        })
      }]
    });
  }

  async publishInventoryUpdate(hubId, inventoryData) {
    await this.producer.send({
      topic: 'inventory-updates',
      messages: [{
        key: hubId,
        value: JSON.stringify({
          hubId,
          timestamp: Date.now(),
          data: inventoryData
        })
      }]
    });
  }
}

module.exports = new KafkaService();
```

## Integration with WebSocket
```javascript
// Use Kafka for durability, WebSocket for real-time
const kafkaService = require('./kafkaService');
const socketManager = require('./socketManager');

// When order is created
async function createOrder(orderData) {
  // Save to database
  const order = await Order.create(orderData);
  
  // Publish to Kafka for analytics/audit
  await kafkaService.publishOrderEvent('order-created', order);
  
  // Send real-time notification via WebSocket
  socketManager.notifyOrderUpdate(order.customerId, order);
  
  return order;
}
```

This would give you both real-time communication AND enterprise-grade message durability.
