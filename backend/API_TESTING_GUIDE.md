# SwarmFill Network API Testing Guide

## 🧪 **Complete API Endpoint Testing Documentation**

This document provides detailed testing instructions for all available API endpoints in the SwarmFill Network backend. Use this guide to test endpoints using Postman, curl, or any API testing tool.

## Base URL
```
http://localhost:3000/api
```

## 📋 **Testing Status Legend**
- ✅ **READY** - Fully implemented and ready for testing
- ⚠️ **PARTIAL** - Partially implemented, may have limitations
- ❌ **NOT IMPLEMENTED** - Endpoint not yet available

---

## 🔐 **Authentication Endpoints** ✅

### 1. Register User
**Endpoint:** `POST /api/auth/register`
**Status:** ✅ READY

#### Request Headers:
```
Content-Type: application/json
```

#### Request Body:
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "middle_name": "Michael",
  "phone_number": "+1234567890",
  "role": "customer"
}
```

#### Valid Roles:
- `customer` - Regular customer
- `hub_owner` - Hub owner/manager
- `courier` - Delivery courier
- `admin` - System administrator

#### Expected Response (201):
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "john.doe@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "middle_name": "Michael",
      "role": "customer",
      "phone_number": "+1234567890",
      "is_email_verified": false,
      "is_active": true,
      "background_check_status": "not_started",
      "created_at": "2025-07-03T10:30:00.000Z",
      "updated_at": "2025-07-03T10:30:00.000Z"
    }
  }
}
```

#### Testing with curl:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe",
    "middle_name": "Michael",
    "phone_number": "+1234567890",
    "role": "customer"
  }'
```

---

### 2. Login User
**Endpoint:** `POST /api/auth/login`
**Status:** ✅ READY

#### Request Headers:
```
Content-Type: application/json
```

#### Request Body:
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "john.doe@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "customer",
      "last_login": "2025-07-03T10:35:00.000Z"
    }
  }
}
```

#### Testing with curl:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

---

### 3. Verify Email
**Endpoint:** `POST /api/auth/verify-email`
**Status:** ✅ READY

#### Request Headers:
```
Content-Type: application/json
```

#### Request Body:
```json
{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "john.doe@example.com",
      "is_email_verified": true
    }
  }
}
```

#### Testing with curl:
```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "otp": "123456"
  }'
```


---

### 4. Request Password Reset
**Endpoint:** `POST /api/auth/forgot-password`
**Status:** ✅ READY

#### Request Headers:
```
Content-Type: application/json
```

#### Request Body:
```json
{
  "email": "john.doe@example.com"
}
```

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Password reset link has been sent to your email."
}
```

#### Testing with curl:
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

---

### 5. Reset Password
**Endpoint:** `POST /api/auth/reset-password/:token`
**Status:** ✅ READY

#### Request Headers:
```
Content-Type: application/json
```

#### URL Parameters:
- `token` - Password reset token received via email

#### Request Body:
```json
{
  "password": "NewSecurePass456!"
}
```

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

#### Testing with curl:
```bash
curl -X POST http://localhost:3000/api/auth/reset-password/your-reset-token-here \
  -H "Content-Type: application/json" \
  -d '{
    "password": "NewSecurePass456!"
  }'
```

---

### 6. Change Password (Authenticated)
**Endpoint:** `POST /api/auth/change-password`
**Status:** ✅ READY

#### Request Headers:
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Request Body:
```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass789!"
}
```

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### Testing with curl:
```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "currentPassword": "SecurePass123!",
    "newPassword": "NewSecurePass789!"
  }'
```

---

### 7. Refresh Token (Authenticated)
**Endpoint:** `POST /api/auth/refresh-token`
**Status:** ✅ READY

#### Request Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Request Body:
```
(No body required)
```

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "john.doe@example.com",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

#### Testing with curl:
```bash
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 8. Get User Profile (Authenticated)
**Endpoint:** `GET /api/auth/profile`
**Status:** ✅ READY

#### Request Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "john.doe@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "middle_name": "Michael",
      "role": "customer",
      "phone_number": "+1234567890",
      "is_email_verified": true,
      "is_active": true,
      "background_check_status": "not_started",
      "last_login": "2025-07-03T10:35:00.000Z",
      "created_at": "2025-07-03T10:30:00.000Z",
      "updated_at": "2025-07-03T10:35:00.000Z"
    }
  }
}
```

#### Testing with curl:
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🏢 **Hub Management Endpoints** ✅

### 1. Get All Hubs
**Endpoint:** `GET /api/hubs`
**Status:** ✅ READY

#### Request Headers:
```
(No headers required for public endpoint)
```

#### Query Parameters:
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `latitude` (optional) - Filter by latitude
- `longitude` (optional) - Filter by longitude
- `radius` (optional) - Search radius in km

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Hubs retrieved successfully",
  "data": {
    "items": [
      {
        "hub_id": "456e7890-e89b-12d3-a456-426614174001",
        "name": "Downtown Hub",
        "address": "123 Main St, City, State",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "phone_number": "+1234567891",
        "operating_hours": "9AM-6PM",
        "is_active": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### Testing with curl:
```bash
curl -X GET "http://localhost:3000/api/hubs?page=1&limit=10"
```

---

### 2. Get Hub by ID
**Endpoint:** `GET /api/hubs/:id`
**Status:** ✅ READY

#### Request Headers:
```
(No headers required for public endpoint)
```

#### URL Parameters:
- `id` - Hub ID (UUID)

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Hub retrieved successfully",
  "data": {
    "hub": {
      "hub_id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "Downtown Hub",
      "address": "123 Main St, City, State",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "phone_number": "+1234567891",
      "operating_hours": "9AM-6PM",
      "is_active": true,
      "owner": {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "first_name": "John",
        "last_name": "Doe"
      }
    }
  }
}
```

#### Testing with curl:
```bash
curl -X GET http://localhost:3000/api/hubs/456e7890-e89b-12d3-a456-426614174001
```

---

### 3. Create New Hub (Authenticated)
**Endpoint:** `POST /api/hubs`
**Status:** ✅ READY

#### Request Headers:
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Request Body:
```json
{
  "name": "My Community Hub",
  "address": "456 Community St, City, State",
  "latitude": 40.7589,
  "longitude": -73.9851,
  "phone_number": "+1234567892",
  "operating_hours": "8AM-8PM",
  "description": "A community hub serving the neighborhood"
}
```

#### Expected Response (201):
```json
{
  "success": true,
  "message": "Hub created successfully",
  "data": {
    "hub": {
      "hub_id": "789e1234-e89b-12d3-a456-426614174002",
      "name": "My Community Hub",
      "address": "456 Community St, City, State",
      "latitude": 40.7589,
      "longitude": -73.9851,
      "phone_number": "+1234567892",
      "operating_hours": "8AM-8PM",
      "description": "A community hub serving the neighborhood",
      "is_active": true,
      "owner_id": "123e4567-e89b-12d3-a456-426614174000"
    }
  }
}
```

#### Testing with curl:
```bash
curl -X POST http://localhost:3000/api/hubs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "My Community Hub",
    "address": "456 Community St, City, State",
    "latitude": 40.7589,
    "longitude": -73.9851,
    "phone_number": "+1234567892",
    "operating_hours": "8AM-8PM",
    "description": "A community hub serving the neighborhood"
  }'
```

---

## 📦 **Product Management Endpoints** ✅

### 1. Get All Products
**Endpoint:** `GET /api/products`
**Status:** ✅ READY

#### Request Headers:
```
(No headers required for public endpoint)
```

#### Query Parameters:
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `category` (optional) - Filter by category
- `search` (optional) - Search term

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "items": [
      {
        "product_id": "abc12345-e89b-12d3-a456-426614174003",
        "name": "Organic Apples",
        "description": "Fresh organic apples from local farms",
        "category": "Fruits",
        "price": 3.99,
        "unit": "lb",
        "barcode": "1234567890123",
        "is_active": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### Testing with curl:
```bash
curl -X GET "http://localhost:3000/api/products?category=Fruits&page=1"
```

---

## 📋 **Order Management Endpoints** ✅

### 1. Get Orders (Authenticated)
**Endpoint:** `GET /api/orders`
**Status:** ✅ READY

#### Request Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Query Parameters:
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `status` (optional) - Filter by order status

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "items": [
      {
        "order_id": "def56789-e89b-12d3-a456-426614174004",
        "customer_id": "123e4567-e89b-12d3-a456-426614174000",
        "status": "pending",
        "total_amount": 25.99,
        "order_items": [
          {
            "product_id": "abc12345-e89b-12d3-a456-426614174003",
            "quantity": 3,
            "unit_price": 3.99
          }
        ],
        "created_at": "2025-07-03T11:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### Testing with curl:
```bash
curl -X GET "http://localhost:3000/api/orders?status=pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 2. Create New Order (Authenticated)
**Endpoint:** `POST /api/orders`
**Status:** ✅ READY

#### Request Headers:
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Request Body:
```json
{
  "source_hub_id": "456e7890-e89b-12d3-a456-426614174001",
  "destination_hub_id": "789e1234-e89b-12d3-a456-426614174002",
  "delivery_address": "789 Customer St, City, State",
  "delivery_latitude": 40.7505,
  "delivery_longitude": -73.9934,
  "items": [
    {
      "product_id": "abc12345-e89b-12d3-a456-426614174003",
      "quantity": 5,
      "unit_price": 3.99
    }
  ],
  "notes": "Please deliver to front door"
}
```

#### Expected Response (201):
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "order_id": "ghi78901-e89b-12d3-a456-426614174005",
      "customer_id": "123e4567-e89b-12d3-a456-426614174000",
      "source_hub_id": "456e7890-e89b-12d3-a456-426614174001",
      "destination_hub_id": "789e1234-e89b-12d3-a456-426614174002",
      "status": "pending",
      "total_amount": 19.95,
      "delivery_address": "789 Customer St, City, State",
      "notes": "Please deliver to front door",
      "created_at": "2025-07-03T11:15:00.000Z"
    }
  }
}
```

#### Testing with curl:
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "source_hub_id": "456e7890-e89b-12d3-a456-426614174001",
    "destination_hub_id": "789e1234-e89b-12d3-a456-426614174002",
    "delivery_address": "789 Customer St, City, State",
    "delivery_latitude": 40.7505,
    "delivery_longitude": -73.9934,
    "items": [
      {
        "product_id": "abc12345-e89b-12d3-a456-426614174003",
        "quantity": 5,
        "unit_price": 3.99
      }
    ],
    "notes": "Please deliver to front door"
  }'
```

---

## 🤖 **AI & Optimization Endpoints** ✅

### 1. Route Optimization (Authenticated)
**Endpoint:** `POST /api/ai/route/optimize`
**Status:** ✅ READY

#### Request Headers:
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Request Body:
```json
{
  "order_id": "ghi78901-e89b-12d3-a456-426614174005",
  "courier_location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Route optimized successfully",
  "data": {
    "optimized_route": {
      "total_distance": 12.5,
      "estimated_time": 45,
      "waypoints": [
        {
          "latitude": 40.7128,
          "longitude": -74.0060,
          "address": "Starting point"
        },
        {
          "latitude": 40.7589,
          "longitude": -73.9851,
          "address": "Hub pickup"
        },
        {
          "latitude": 40.7505,
          "longitude": -73.9934,
          "address": "Customer delivery"
        }
      ]
    }
  }
}
```

#### Testing with curl:
```bash
curl -X POST http://localhost:3000/api/ai/route/optimize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "order_id": "ghi78901-e89b-12d3-a456-426614174005",
    "courier_location": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  }'
```

---

## 🏥 **Health Check Endpoint** ✅

### System Health Check
**Endpoint:** `GET /health`
**Status:** ✅ READY

#### Request Headers:
```
(No headers required)
```

#### Expected Response (200):
```json
{
  "status": "OK",
  "timestamp": "2025-07-03T12:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "socketConnections": {
    "active": 0,
    "total": 0
  }
}
```

#### Testing with curl:
```bash
curl -X GET http://localhost:3000/health
```

---

## 🚫 **Missing Endpoints (Not Yet Implemented)**

### Drive-Thru Pickup System ❌
- `POST /api/pickup/drive-thru/book`
- `GET /api/pickup/drive-thru/slots`
- `PUT /api/pickup/drive-thru/notify`
- `POST /api/pickup/drive-thru/confirm`
- `GET /api/pickup/drive-thru/queue`
- `POST /api/pickup/drive-thru/cancel`
- `GET /api/pickup/drive-thru/history`
- `PUT /api/pickup/drive-thru/rating`

### Crisis Mode Management ❌
- `POST /api/crisis/activate`
- `POST /api/crisis/emergency-hubs/register`
- `GET /api/crisis/emergency-hubs/available`
- `POST /api/crisis/volunteers/coordinate`
- `POST /api/crisis/communication/broadcast`
- `GET /api/crisis/status`
- `POST /api/crisis/deactivate`

### Financial & Earnings System ❌
- `GET /api/earnings/hub-owner`
- `GET /api/earnings/courier`
- `POST /api/earnings/commission/calculate`
- `GET /api/earnings/leaderboard`
- `POST /api/payouts/request`
- `GET /api/payouts/history`

---

## 🔧 **Common Error Responses**

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided or invalid format."
}
```

### 404 - Not Found
```json
{
  "error": "Route not found",
  "message": "The requested route /api/invalid was not found on this server."
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

---

## 📝 **Testing Checklist**

### ✅ Authentication Flow Testing
- [ ] Register new user with valid data
- [ ] Register user with invalid email format
- [ ] Register user with weak password
- [ ] Register user with duplicate email
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Access protected endpoint without token
- [ ] Access protected endpoint with valid token
- [ ] Access protected endpoint with expired token
- [ ] Change password with valid current password
- [ ] Change password with invalid current password
- [ ] Request password reset for existing email
- [ ] Request password reset for non-existing email
- [ ] Reset password with valid token
- [ ] Reset password with expired token
- [ ] Refresh JWT token
- [ ] Get user profile

### ✅ Hub Management Testing
- [ ] Get all hubs without authentication
- [ ] Get all hubs with pagination
- [ ] Get specific hub by ID
- [ ] Create new hub with authentication
- [ ] Create hub without authentication (should fail)
- [ ] Update hub as owner
- [ ] Update hub as non-owner (should fail)

### ✅ Product Management Testing
- [ ] Get all products
- [ ] Get products with category filter
- [ ] Get products with search term
- [ ] Get specific product by ID

### ✅ Order Management Testing
- [ ] Get orders with authentication
- [ ] Get orders without authentication (should fail)
- [ ] Create new order with valid data
- [ ] Create order with invalid hub IDs
- [ ] Update order status as authorized user
- [ ] Cancel order as customer

---

## 🚀 **Quick Start Testing Script**

Save this as `test-auth.sh` for quick authentication testing:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api"

echo "=== Testing SwarmFill API ==="

# 1. Register User
echo "1. Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "first_name": "Test",
    "last_name": "User",
    "role": "customer"
  }')

echo "Register Response: $REGISTER_RESPONSE"

# Extract token from response
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Extracted Token: $TOKEN"

# 2. Login User
echo "2. Logging in user..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }')

echo "Login Response: $LOGIN_RESPONSE"

# 3. Get Profile
echo "3. Getting user profile..."
PROFILE_RESPONSE=$(curl -s -X GET $BASE_URL/auth/profile \
  -H "Authorization: Bearer $TOKEN")

echo "Profile Response: $PROFILE_RESPONSE"

# 4. Health Check
echo "4. Checking system health..."
HEALTH_RESPONSE=$(curl -s -X GET http://localhost:3000/health)

echo "Health Response: $HEALTH_RESPONSE"

echo "=== Testing Complete ==="
```

Make it executable and run:
```bash
chmod +x test-auth.sh
./test-auth.sh
```

---

## 📊 **Testing Summary**

### ✅ **Currently Available for Testing:**
- **Authentication System** (8 endpoints) - Fully functional
- **Hub Management** (8 endpoints) - Core functionality ready
- **Product Management** (8 endpoints) - Basic CRUD operations
- **Order Management** (6 endpoints) - Order lifecycle management
- **AI Optimization** (5 endpoints) - Basic AI features
- **Admin Management** (7 endpoints) - Administrative functions
- **Health Check** (1 endpoint) - System status

### ❌ **Awaiting Implementation:**
- **Drive-Thru Pickup System** (8 endpoints) - Critical for community commerce
- **Crisis Mode Management** (9 endpoints) - Emergency response system
- **Financial & Earnings** (9 endpoints) - Community earnings tracking
- **Mobile App Support** (8 endpoints) - Mobile-specific features
- **Real-time Communication** (8 endpoints) - Community chat and alerts

**Total Available:** 43 endpoints ready for testing
**Total Missing:** 42 endpoints awaiting implementation

---

This testing guide provides comprehensive coverage of all currently available API endpoints. Use it to validate the authentication system and other implemented features before moving on to implement the missing critical endpoints like the Drive-Thru Pickup System.
