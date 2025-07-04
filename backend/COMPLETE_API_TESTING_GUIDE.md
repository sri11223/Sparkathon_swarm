# 🧪 COMPREHENSIVE API TESTING GUIDE

## 🚀 **QUICK START - ONE-COMMAND SETUP**

### 🎯 **Fastest Way to Get Started**
```bash
# This single command will:
# 1. Check environment setup
# 2. Run migrations
# 3. Seed database
# 4. Start server
# 5. Generate test tokens
npm run startup
```

**That's it! The script will provide you with all Bearer tokens and API examples.**

---

## 📋 **MANUAL SETUP (Alternative)**

### **Prerequisites**
```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# 3. Run migrations and seed data
npm run db:migrate
npm run db:seed

# 4. Start the server
npm start
```

### 🔐 **AUTHENTICATION FLOW - How to Get Bearer Tokens**

#### **Method 1: Use Pre-seeded Accounts (Recommended)**

After running `npm run startup` or `npm run db:seed`, you'll have these test accounts:

```bash
# ADMIN ACCOUNT
Email: admin@swarmfill.com
Password: password123
Role: admin

# HUB OWNER ACCOUNT
Email: hubowner1@swarmfill.com
Password: password123
Role: hub_owner

# COURIER ACCOUNT
Email: courier1@swarmfill.com
Password: password123
Role: courier

# CUSTOMER ACCOUNT
Email: customer1@swarmfill.com
Password: password123
Role: customer
```

#### **Login Examples for Each Role:**

```bash
# 🔑 GET ADMIN TOKEN
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@swarmfill.com",
    "password": "password123"
  }'

# 🔑 GET HUB OWNER TOKEN
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hubowner1@swarmfill.com",
    "password": "password123"
  }'

# 🔑 GET COURIER TOKEN
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "courier1@swarmfill.com", 
    "password": "password123"
  }'

# 🔑 GET CUSTOMER TOKEN
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer1@swarmfill.com",
    "password": "password123"
  }'
```

#### **Method 2: Register New Account**

```bash
# Register New Customer
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "Password123!",
    "first_name": "New",
    "last_name": "User",
    "role": "customer",
    "phone_number": "+1234567890"
  }'

# Then login with the new account
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "Password123!"
  }'
```

#### **Understanding the Response:**

All login responses follow this format:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NSIsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTcwNjE5MTIwMCwiZXhwIjoxNzA2Mjc3NjAwfQ.example_signature",
    "user": {
      "user_id": "12345",
      "email": "customer1@swarmfill.com",
      "role": "customer",
      "first_name": "Customer",
      "last_name": "One"
    }
  }
}
```

**Use the `token` value in the Authorization header for all protected endpoints.**

#### **Using Tokens in Requests:**

```bash
# Replace YOUR_TOKEN_HERE with the actual token from login response
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Example with a real token (truncated for display):
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
---

## 🧪 **API TESTING BY CATEGORY**

### 🔐 **1. Authentication Endpoints (8 endpoints)**

#### **✅ Verify Login Works for All Roles:**
```bash
# Test Admin Login (Full access)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@swarmfill.com", "password": "password123"}'

# Test Hub Owner Login (Hub management)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "hubowner1@swarmfill.com", "password": "password123"}'

# Test Courier Login (Route management)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "courier1@swarmfill.com", "password": "password123"}'

# Test Customer Login (Order management)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "customer1@swarmfill.com", "password": "password123"}'
```

#### **✅ Test Protected Endpoints:**
```bash
# Get Profile (requires any valid token)
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Change Password (requires current user token)
curl -X POST http://localhost:3001/api/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword": "password123", "newPassword": "NewPassword123!"}'

# Refresh Token (requires valid token)
curl -X POST http://localhost:3001/api/auth/refresh-token \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 🏢 **2. Hub Management (15 endpoints)**

```bash
# Get All Hubs (Public)
curl -X GET http://localhost:3001/api/hubs

# Get Hub by ID (Public)
curl -X GET http://localhost:3001/api/hubs/HUB_ID_FROM_SEED_DATA

# Create Hub (Hub Owner token required)
curl -X POST http://localhost:3001/api/hubs \
  -H "Authorization: Bearer HUB_OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hub",
    "address": "123 Test Street",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "capacity_m3": 100,
    "description": "A test hub for API testing"
  }'

# Get Hub Inventory
curl -X GET http://localhost:3001/api/hubs/HUB_ID/inventory
```

### 🏘️ **3. Community Commerce (9 NEW endpoints)**

```bash
# Register Community Hub (Hub Owner token)
curl -X POST http://localhost:3001/api/community/register \
  -H "Authorization: Bearer HUB_OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Community Test Hub",
    "description": "A test community hub",
    "category": "local_marketplace",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Community St"
    }
  }'

# Get Community Hubs (Public)
curl -X GET http://localhost:3001/api/community/hubs

# Get Community Leaderboard (Requires token)
curl -X GET http://localhost:3001/api/community/leaderboard \
  -H "Authorization: Bearer ANY_USER_TOKEN"

# Get Community Earnings (User token)
curl -X GET http://localhost:3001/api/community/earnings \
  -H "Authorization: Bearer COURIER_TOKEN"
```

### 🚨 **4. Crisis Management (10 NEW endpoints)**

```bash
# Activate Crisis (Admin token required)
curl -X POST http://localhost:3001/api/crisis/activate \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Emergency",
    "description": "Testing crisis activation",
    "crisis_type": "emergency",
    "severity_level": "medium",
    "affected_areas": [{"area": "Downtown", "severity": "high"}]
  }'

# Get Crisis Events (Public)
curl -X GET http://localhost:3001/api/crisis/events

# Register as Volunteer (Any user token)
curl -X POST http://localhost:3001/api/crisis/volunteer \
  -H "Authorization: Bearer ANY_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "crisis_id": "CRISIS_ID_FROM_RESPONSE",
    "volunteer_type": "logistics",
    "availability": "full_time",
    "skills": ["driving", "inventory_management"]
  }'

# Submit Safety Report (Any user token)
curl -X POST http://localhost:3001/api/crisis/safety-report \
  -H "Authorization: Bearer ANY_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "incident_type": "unsafe_conditions",
    "severity": "medium",
    "location": {"latitude": 40.7128, "longitude": -74.0060, "address": "Test Location"},
    "description": "Testing safety report submission"
  }'
```

### 🔔 **5. Notification System (9 NEW endpoints)**

```bash
# Get User Notifications (User token)
curl -X GET http://localhost:3001/api/notifications \
  -H "Authorization: Bearer ANY_USER_TOKEN"

# Get Notification Preferences (User token)
curl -X GET http://localhost:3001/api/notifications/preferences \
  -H "Authorization: Bearer ANY_USER_TOKEN"

# Update Notification Preferences (User token)
curl -X PUT http://localhost:3001/api/notifications/preferences \
  -H "Authorization: Bearer ANY_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "order_notifications": true,
      "delivery_notifications": true,
      "promotional_notifications": false,
      "emergency_notifications": true
    }
  }'

# Send Notification (Admin token)
curl -X POST http://localhost:3001/api/notifications/send \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER_ID_FROM_SEED_DATA",
    "title": "Test Notification",
    "body": "This is a test notification",
    "type": "system_alert"
  }'

# Send Emergency Notification (Admin token)
curl -X POST http://localhost:3001/api/notifications/emergency \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Emergency Alert",
    "body": "This is a test emergency notification",
    "severity": "high",
    "affected_areas": ["Downtown", "Midtown"]
  }'
```

### 📱 **6. Mobile Support (6 NEW endpoints)**

```bash
# Register Push Token (User token)
curl -X POST http://localhost:3001/api/mobile/push/register \
  -H "Authorization: Bearer ANY_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "device_token": "test_device_token_123",
    "device_type": "ios",
    "device_info": {"model": "iPhone 15", "os": "iOS 17.1"},
    "app_version": "1.0.0"
  }'

# Update Location (User token)
curl -X POST http://localhost:3001/api/mobile/location/update \
  -H "Authorization: Bearer ANY_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 10,
    "heading": 45,
    "speed": 25
  }'

# Get Nearby Services (User token)
curl -X GET "http://localhost:3001/api/mobile/nearby?latitude=40.7128&longitude=-74.0060&radius=5000" \
  -H "Authorization: Bearer ANY_USER_TOKEN"

# Sync Offline Data (User token)
curl -X POST http://localhost:3001/api/mobile/offline/sync \
  -H "Authorization: Bearer ANY_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "offline_actions": [
      {"type": "location_update", "data": {"latitude": 40.7128, "longitude": -74.0060}, "timestamp": "2025-07-04T12:00:00Z"}
    ],
    "last_sync": "2025-07-04T11:00:00Z"
  }'
```

### 🤖 **7. Advanced AI & SmartLoad (5 NEW endpoints)**

```bash
# Warehouse Layout Optimization (Hub Owner token)
curl -X POST http://localhost:3001/api/ai/smartload/warehouse-layout \
  -H "Authorization: Bearer HUB_OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hub_id": "HUB_ID_FROM_SEED_DATA",
    "warehouse_dimensions": {"length": 50, "width": 30, "height": 6},
    "current_layout": "traditional",
    "inventory_data": {"total_products": 100, "categories": 5}
  }'

# Truck Loading Optimization (Hub Owner token)
curl -X POST http://localhost:3001/api/ai/smartload/truck-loading \
  -H "Authorization: Bearer HUB_OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_constraints": {"max_weight": 1000, "max_volume": 10},
    "delivery_items": [
      {"item_id": "1", "weight": 5, "volume": 0.5, "priority": "high"},
      {"item_id": "2", "weight": 3, "volume": 0.3, "priority": "medium"}
    ],
    "route_optimization": true
  }'

# Crisis Demand Forecast (Admin token)
curl -X POST http://localhost:3001/api/ai/smartload/crisis-forecast \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "crisis_type": "natural_disaster",
    "affected_population": 10000,
    "crisis_duration_hours": 72,
    "historical_data": {"similar_events": 3, "avg_demand_increase": 300}
  }'

# Get Optimization Results (User token)
curl -X GET http://localhost:3001/api/ai/smartload/results/OPTIMIZATION_ID \
  -H "Authorization: Bearer ANY_USER_TOKEN"
```

### 🔄 **8. Real-time Communication (5 NEW endpoints)**

```bash
# Join Communication Room (User token)
curl -X POST http://localhost:3001/api/realtime/join-room \
  -H "Authorization: Bearer ANY_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": "test_room_123",
    "room_type": "community_hub"
  }'

# Leave Communication Room (User token)
curl -X POST http://localhost:3001/api/realtime/leave-room \
  -H "Authorization: Bearer ANY_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": "test_room_123",
    "room_type": "community_hub"
  }'

# Broadcast Message to Room (User token)
curl -X POST http://localhost:3001/api/realtime/broadcast \
  -H "Authorization: Bearer ANY_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": "test_room_123",
    "room_type": "community_hub",
    "message": "Hello everyone in the community hub!",
    "message_type": "text",
    "priority": "normal"
  }'

# Get Active Rooms (User token)
curl -X GET http://localhost:3001/api/realtime/rooms \
  -H "Authorization: Bearer ANY_USER_TOKEN"

# Get Room Info (User token)
curl -X GET http://localhost:3001/api/realtime/rooms/community_hub/test_room_123 \
  -H "Authorization: Bearer ANY_USER_TOKEN"
```

---

## 🧪 **COMPREHENSIVE TESTING SCENARIOS**

### **Scenario 1: Complete User Journey**
```bash
# 1. Register new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "newuser@test.com", "password": "Password123!", "first_name": "New", "last_name": "User", "role": "customer"}'

# 2. Login to get token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "newuser@test.com", "password": "Password123!"}'

# 3. Get user profile
curl -X GET http://localhost:3001/api/users/profile/detailed \
  -H "Authorization: Bearer YOUR_NEW_TOKEN"

# 4. Browse hubs
curl -X GET http://localhost:3001/api/hubs

# 5. Join community hub
curl -X POST http://localhost:3001/api/realtime/join-room \
  -H "Authorization: Bearer YOUR_NEW_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"room_id": "community_hub_1", "room_type": "community_hub"}'
```

### **Scenario 2: Crisis Response Flow**
```bash
# 1. Admin activates crisis
curl -X POST http://localhost:3001/api/crisis/activate \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Supply Shortage", "crisis_type": "supply_shortage", "severity_level": "high"}'

# 2. User volunteers
curl -X POST http://localhost:3001/api/crisis/volunteer \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"crisis_id": "CRISIS_ID", "volunteer_type": "logistics"}'

# 3. Create emergency hub
curl -X POST http://localhost:3001/api/crisis/emergency-hub \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"crisis_id": "CRISIS_ID", "hub_id": "HUB_ID", "emergency_role": "supply_center"}'

# 4. Broadcast emergency message
curl -X POST http://localhost:3001/api/crisis/broadcast \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"crisis_id": "CRISIS_ID", "message": "Emergency supplies needed", "urgency": "high"}'
```

---

## ✅ **SUCCESS CRITERIA & EXPECTED RESPONSES**

### **Successful Response Format:**
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}
```

### **Error Response Format:**
```json
{
  "status": "error",
  "message": "Error description",
  "error": "Detailed error message"
}
```

### **Authentication Errors:**
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: User doesn't have required permissions
- **400 Bad Request**: Invalid input data

---

## 🔍 **HEALTH CHECK & SYSTEM STATUS**

```bash
# Check server health
curl -X GET http://localhost:3001/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2025-07-04T12:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "socketConnections": {
    "totalConnections": 0,
    "customers": 0,
    "couriers": 0,
    "hubOwners": 0
  }
}
```

---

## 🚀 **AUTOMATED TESTING WITH POSTMAN**

### **Import Collection:**
1. Create a Postman collection
2. Set environment variables:
   - `BASE_URL`: http://localhost:3001
   - `AUTH_TOKEN`: (will be set automatically after login)
   - `USER_ID`: (will be set automatically after login)

### **Pre-request Scripts:**
```javascript
// For requests requiring authentication
if (pm.environment.get("AUTH_TOKEN")) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + pm.environment.get("AUTH_TOKEN")
    });
}
```

### **Test Scripts:**
```javascript
// Save token from login response
if (pm.response.json().data && pm.response.json().data.token) {
    pm.environment.set("AUTH_TOKEN", pm.response.json().data.token);
    pm.environment.set("USER_ID", pm.response.json().data.user.user_id);
}

// Test response status
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Test response structure
pm.test("Response has success status", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql("success");
});
```

---

## 🎯 **FINAL VERIFICATION CHECKLIST**

- [ ] All 125+ endpoints respond without errors
- [ ] Authentication works for all user roles
- [ ] Database operations complete successfully
- [ ] Real-time features connect and communicate
- [ ] Mobile endpoints handle device-specific data
- [ ] Crisis management coordinates emergency response
- [ ] Community features enable user engagement
- [ ] AI optimization returns meaningful results
- [ ] Notification system delivers messages correctly
- [ ] Input validation prevents malformed requests

**🚀 Your SwarmFill Network backend is now fully tested and production-ready!**
