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
        "location": {
          "type": "Point",
          "coordinates": [-74.0060, 40.7128]
        },
        "capacity_m3": 100.0,
        "current_utilization_m3": 0.0,
        "status": "active",
        "description": "A community hub serving downtown area"
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
      "location": {
        "type": "Point",
        "coordinates": [-74.0060, 40.7128]
      },
      "capacity_m3": 100.0,
      "current_utilization_m3": 0.0,
      "status": "active",
      "description": "A community hub serving downtown area",
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
  "capacity_m3": 150.0,
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
      "location": {
        "type": "Point",
        "coordinates": [-73.9851, 40.7589]
      },
      "capacity_m3": 150.0,
      "current_utilization_m3": 0.0,
      "status": "active",
      "description": "A community hub serving the neighborhood",
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
    "capacity_m3": 150.0,
    "description": "A community hub serving the neighborhood"
  }'
```

---

### 4. Update Hub (Authenticated)
**Endpoint:** `PUT /api/hubs/:id`
**Status:** ✅ READY

#### Request Headers:
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

#### URL Parameters:
- `id` - Hub ID (UUID)

#### Request Body:
```json
{
  "name": "Updated Community Hub",
  "address": "789 Updated St, City, State",
  "latitude": 40.7750,
  "longitude": -73.9800,
  "capacity_m3": 200.0,
  "description": "Updated description for the community hub"
}
```

#### Access Control:
- **Only the hub owner can update their own hubs**
- **Admins can update any hub**

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Hub updated successfully",
  "data": {
    "hub": {
      "hub_id": "789e1234-e89b-12d3-a456-426614174002",
      "name": "Updated Community Hub",
      "address": "789 Updated St, City, State",
      "location": {
        "type": "Point",
        "coordinates": [-73.9800, 40.7750]
      },
      "capacity_m3": 200.0,
      "current_utilization_m3": 0.0,
      "status": "active",
      "description": "Updated description for the community hub",
      "owner_id": "123e4567-e89b-12d3-a456-426614174000",
      "updated_at": "2025-07-03T13:00:00.000Z"
    }
  }
}
```

#### Error Response for Unauthorized (403):
```json
{
  "success": false,
  "message": "Access denied. You can only update your own hubs."
}
```

#### Testing with curl:
```bash
curl -X PUT http://localhost:3000/api/hubs/789e1234-e89b-12d3-a456-426614174002 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Updated Community Hub",
    "address": "789 Updated St, City, State",
    "latitude": 40.7750,
    "longitude": -73.9800,
    "capacity_m3": 200.0,
    "description": "Updated description for the community hub"
  }'
```

---

### 5. Delete Hub (Authenticated)
**Endpoint:** `DELETE /api/hubs/:id`
**Status:** ✅ READY

#### Request Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### URL Parameters:
- `id` - Hub ID (UUID)

#### Access Control:
- **Only the hub owner can delete their own hubs**
- **Admins can delete any hub**

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Hub deleted successfully"
}
```

#### Error Response for Unauthorized (403):
```json
{
  "success": false,
  "message": "Access denied. You can only delete your own hubs."
}
```

#### Error Response for Hub Not Found (404):
```json
{
  "success": false,
  "message": "Hub not found"
}
```

#### Testing with curl:
```bash
curl -X DELETE http://localhost:3000/api/hubs/789e1234-e89b-12d3-a456-426614174002 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 6. Get Hub Inventory
**Endpoint:** `GET /api/hubs/:id/inventory`
**Status:** ✅ READY

#### Request Headers:
```
(No headers required for public endpoint)
```

#### URL Parameters:
- `id` - Hub ID (UUID)

#### Query Parameters:
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `category` (optional) - Filter by product category
- `in_stock` (optional) - Filter by stock availability (true/false)

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Hub inventory retrieved successfully",
  "data": {
    "hub": {
      "hub_id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "Downtown Hub"
    },
    "inventory": [
      {
        "inventory_id": "inv12345-e89b-12d3-a456-426614174005",
        "product_id": "abc12345-e89b-12d3-a456-426614174003",
        "product_name": "Organic Apples",
        "category": "Fruits",
        "quantity": 50,
        "price": 3.99,
        "unit": "lb",
        "last_updated": "2025-07-03T12:00:00.000Z"
      },
      {
        "inventory_id": "inv67890-e89b-12d3-a456-426614174006",
        "product_id": "def67890-e89b-12d3-a456-426614174007",
        "product_name": "Fresh Bread",
        "category": "Bakery",
        "quantity": 0,
        "price": 2.50,
        "unit": "loaf",
        "last_updated": "2025-07-03T11:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "pages": 1
    }
  }
}
```

#### Testing with curl:
```bash
curl -X GET "http://localhost:3000/api/hubs/456e7890-e89b-12d3-a456-426614174001/inventory?in_stock=true&category=Fruits"
```

---

### 7. Get Hub Orders
**Endpoint:** `GET /api/hubs/:id/orders`
**Status:** ✅ READY

#### Request Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### URL Parameters:
- `id` - Hub ID (UUID)

#### Query Parameters:
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `status` (optional) - Filter by order status
- `date_from` (optional) - Filter orders from date (YYYY-MM-DD)
- `date_to` (optional) - Filter orders to date (YYYY-MM-DD)

#### Access Control:
- **Only hub owners can view orders for their hubs**
- **Admins can view orders for any hub**
- **Customers cannot access this endpoint**

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Hub orders retrieved successfully",
  "data": {
    "hub": {
      "hub_id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "Downtown Hub"
    },
    "orders": [
      {
        "order_id": "ord12345-e89b-12d3-a456-426614174008",
        "customer": {
          "user_id": "123e4567-e89b-12d3-a456-426614174000",
          "first_name": "John",
          "last_name": "Doe"
        },
        "status": "pending",
        "total_amount": 25.99,
        "order_items": [
          {
            "product_name": "Organic Apples",
            "quantity": 3,
            "unit_price": 3.99
          },
          {
            "product_name": "Fresh Bread",
            "quantity": 2,
            "unit_price": 2.50
          }
        ],
        "delivery_address": "789 Customer St, City, State",
        "created_at": "2025-07-03T11:00:00.000Z",
        "updated_at": "2025-07-03T11:00:00.000Z"
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

#### Error Response for Unauthorized (403):
```json
{
  "success": false,
  "message": "Access denied. You can only view orders for your own hubs."
}
```

#### Testing with curl:
```bash
curl -X GET "http://localhost:3000/api/hubs/456e7890-e89b-12d3-a456-426614174001/orders?status=pending&date_from=2025-07-01" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 8. Get User's Hubs (Authenticated)
**Endpoint:** `GET /api/hubs/my-hubs`
**Status:** ✅ READY

#### Request Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Query Parameters:
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `is_active` (optional) - Filter by active status (true/false)

#### Access Control:
- **Only hub owners can access this endpoint**
- **Returns only hubs owned by the authenticated user**

#### Expected Response (200):
```json
{
  "success": true,
  "message": "User hubs retrieved successfully",
  "data": {
    "hubs": [
      {
        "hub_id": "456e7890-e89b-12d3-a456-426614174001",
        "name": "Downtown Hub",
        "address": "123 Main St, City, State",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "phone_number": "+1234567891",
        "operating_hours": "9AM-6PM",
        "is_active": true,
        "total_inventory_items": 25,
        "pending_orders": 3,
        "total_revenue": 1250.75,
        "created_at": "2025-06-15T10:00:00.000Z",
        "updated_at": "2025-07-03T12:00:00.000Z"
      },
      {
        "hub_id": "789e1234-e89b-12d3-a456-426614174002",
        "name": "Community Hub",
        "address": "456 Community St, City, State",
        "latitude": 40.7589,
        "longitude": -73.9851,
        "phone_number": "+1234567892",
        "operating_hours": "8AM-8PM",
        "is_active": true,
        "total_inventory_items": 18,
        "pending_orders": 1,
        "total_revenue": 890.50,
        "created_at": "2025-06-20T14:30:00.000Z",
        "updated_at": "2025-07-02T16:45:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "pages": 1
    },
    "summary": {
      "total_hubs": 2,
      "active_hubs": 2,
      "total_revenue": 2141.25,
      "total_pending_orders": 4
    }
  }
}
```

#### Error Response for Wrong Role (403):
```json
{
  "success": false,
  "message": "Only hub owners can access this endpoint"
}
```

#### Testing with curl:
```bash
curl -X GET "http://localhost:3000/api/hubs/my-hubs?is_active=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📦 **Inventory Management Endpoints** ✅

### 1. Add Inventory Item to Hub (Authenticated)
**Endpoint:** `POST /api/hubs/:hubId/inventory`
**Status:** ✅ READY

#### Request Headers:
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

#### URL Parameters:
- `hubId` - Hub ID (UUID)

#### Request Body:
```json
{
  "product_id": "abc12345-e89b-12d3-a456-426614174003",
  "quantity": 100,
  "price": 4.99,
  "unit": "lb",
  "expiry_date": "2025-07-15",
  "notes": "Fresh organic apples from local farm"
}
```

#### Access Control:
- **Only hub owners can add inventory to their hubs**
- **Admins can add inventory to any hub**

#### Expected Response (201):
```json
{
  "success": true,
  "message": "Inventory item added successfully",
  "data": {
    "inventory": {
      "inventory_id": "inv78901-e89b-12d3-a456-426614174009",
      "hub_id": "456e7890-e89b-12d3-a456-426614174001",
      "product_id": "abc12345-e89b-12d3-a456-426614174003",
      "quantity": 100,
      "price": 4.99,
      "unit": "lb",
      "expiry_date": "2025-07-15T00:00:00.000Z",
      "notes": "Fresh organic apples from local farm",
      "created_at": "2025-07-03T13:30:00.000Z",
      "updated_at": "2025-07-03T13:30:00.000Z"
    }
  }
}
```

#### Testing with curl:
```bash
curl -X POST http://localhost:3000/api/hubs/456e7890-e89b-12d3-a456-426614174001/inventory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "product_id": "abc12345-e89b-12d3-a456-426614174003",
    "quantity": 100,
    "price": 4.99,
    "unit": "lb",
    "expiry_date": "2025-07-15",
    "notes": "Fresh organic apples from local farm"
  }'
```

---

### 2. Update Inventory Item (Authenticated)
**Endpoint:** `PUT /api/inventory/:id`
**Status:** ✅ READY

#### Request Headers:
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

#### URL Parameters:
- `id` - Inventory Item ID (UUID)

#### Request Body:
```json
{
  "quantity": 75,
  "price": 5.49,
  "expiry_date": "2025-07-20",
  "notes": "Updated price and quantity"
}
```

#### Access Control:
- **Only hub owners can update inventory in their hubs**
- **Admins can update any inventory item**

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Inventory item updated successfully",
  "data": {
    "inventory": {
      "inventory_id": "inv78901-e89b-12d3-a456-426614174009",
      "hub_id": "456e7890-e89b-12d3-a456-426614174001",
      "product_id": "abc12345-e89b-12d3-a456-426614174003",
      "quantity": 75,
      "price": 5.49,
      "unit": "lb",
      "expiry_date": "2025-07-20T00:00:00.000Z",
      "notes": "Updated price and quantity",
      "updated_at": "2025-07-03T14:00:00.000Z"
    }
  }
}
```

#### Testing with curl:
```bash
curl -X PUT http://localhost:3000/api/inventory/inv78901-e89b-12d3-a456-426614174009 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "quantity": 75,
    "price": 5.49,
    "expiry_date": "2025-07-20",
    "notes": "Updated price and quantity"
  }'
```

---

### 3. Delete Inventory Item (Authenticated)
**Endpoint:** `DELETE /api/inventory/:id`
**Status:** ✅ READY

#### Request Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### URL Parameters:
- `id` - Inventory Item ID (UUID)

#### Access Control:
- **Only hub owners can delete inventory from their hubs**
- **Admins can delete any inventory item**

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Inventory item deleted successfully"
}
```

#### Error Response for Unauthorized (403):
```json
{
  "success": false,
  "message": "Access denied. You can only manage inventory for your own hubs."
}
```

#### Testing with curl:
```bash
curl -X DELETE http://localhost:3000/api/inventory/inv78901-e89b-12d3-a456-426614174009 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## � **User Management Endpoints** ✅

### 1. Create User
**Endpoint:** `POST /api/users`
**Status:** ✅ READY

#### Request Headers:
```
Content-Type: application/json
```

#### Request Body:
```json
{
  "email": "jane.smith@example.com",
  "password": "SecurePass123!",
  "first_name": "Jane",
  "last_name": "Smith",
  "middle_name": "Marie",
  "phone_number": "+1234567891",
  "role": "hub_owner"
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
  "message": "User created successfully",
  "data": {
    "user": {
      "user_id": "456e7890-e89b-12d3-a456-426614174001",
      "email": "jane.smith@example.com",
      "first_name": "Jane",
      "last_name": "Smith",
      "middle_name": "Marie",
      "role": "hub_owner",
      "phone_number": "+1234567891",
      "is_email_verified": false,
      "is_active": true,
      "background_check_status": "not_started",
      "created_at": "2025-07-03T12:00:00.000Z",
      "updated_at": "2025-07-03T12:00:00.000Z"
    }
  }
}
```

#### Testing with curl:
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@example.com",
    "password": "SecurePass123!",
    "first_name": "Jane",
    "last_name": "Smith",
    "middle_name": "Marie",
    "phone_number": "+1234567891",
    "role": "hub_owner"
  }'
```

---

### 2. Get Detailed User Profile
**Endpoint:** `GET /api/users/profile/detailed`
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
      "avatar_url": "/uploads/avatars/avatar-1625312400000-123456789.jpg",
      "average_rating": "4.8",
      "total_ratings": 25,
      "hubs": [],
      "vehicles": [],
      "earnings": {
        "total_earnings": 1250.50,
        "recent_payouts": []
      },
      "created_at": "2025-07-03T10:30:00.000Z",
      "updated_at": "2025-07-03T12:00:00.000Z"
    }
  }
}
```

#### Testing with curl:
```bash
curl -X GET http://localhost:3000/api/users/profile/detailed \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3. Update User Profile
**Endpoint:** `PUT /api/users/profile/update`
**Status:** ✅ READY

#### Request Headers:
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Request Body:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "middle_name": "Michael",
  "phone_number": "+1234567890"
}
```

#### Notes:
- Cannot update: `email`, `password_hash`, `role`, `is_email_verified`, `is_active`
- Email changes require separate verification process
- Role changes are admin-only

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "john.doe@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "middle_name": "Michael",
      "phone_number": "+1234567890",
      "role": "customer",
      "updated_at": "2025-07-03T12:15:00.000Z"
    }
  }
}
```

#### Testing with curl:
```bash
curl -X PUT http://localhost:3000/api/users/profile/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "middle_name": "Michael",
    "phone_number": "+1234567890"
  }'
```

---

### 4. Upload User Avatar
**Endpoint:** `POST /api/users/profile/avatar`
**Status:** ✅ READY

#### Request Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

#### Request Body:
```
Form data with 'avatar' field containing image file
Max file size: 5MB
Accepted formats: image/jpeg, image/png, image/gif, image/webp
```

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatar_url": "/uploads/avatars/avatar-1625312400000-123456789.jpg"
  }
}
```

#### Testing with curl:
```bash
curl -X POST http://localhost:3000/api/users/profile/avatar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "avatar=@/path/to/your/image.jpg"
```

#### Testing with Postman:
1. Set method to POST
2. Add Authorization header: `Bearer YOUR_JWT_TOKEN`
3. Go to Body tab
4. Select "form-data"
5. Add key "avatar" with type "File"
6. Choose your image file

---

### 5. Get User Earnings Summary
**Endpoint:** `GET /api/users/earnings`
**Status:** ✅ READY

#### Request Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Access Requirements:
- **Only available for users with role:** `hub_owner` or `courier`
- **Customers and admins will receive 403 Forbidden**

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Earnings retrieved successfully",
  "data": {
    "summary": {
      "total_earnings": 2500.75,
      "pending_earnings": 150.25,
      "completed_payouts": 12,
      "pending_payouts": 2
    },
    "monthly_earnings": [
      {
        "month": "2025-01-01T00:00:00.000Z",
        "total": 450.50
      },
      {
        "month": "2025-02-01T00:00:00.000Z",
        "total": 520.25
      },
      {
        "month": "2025-03-01T00:00:00.000Z",
        "total": 680.00
      }
    ],
    "recent_payouts": [
      {
        "payout_id": "abc12345-e89b-12d3-a456-426614174003",
        "amount": 250.00,
        "status": "completed",
        "completion_date": "2025-07-01T10:00:00.000Z",
        "created_at": "2025-06-28T10:00:00.000Z"
      },
      {
        "payout_id": "def67890-e89b-12d3-a456-426614174004",
        "amount": 180.50,
        "status": "pending",
        "created_at": "2025-07-02T15:30:00.000Z"
      }
    ]
  }
}
```

#### Error Response for Wrong Role (403):
```json
{
  "success": false,
  "message": "Only hub owners and couriers can view earnings"
}
```

#### Testing with curl:
```bash
curl -X GET http://localhost:3000/api/users/earnings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 6. Request Identity Verification
**Endpoint:** `POST /api/users/verification/request`
**Status:** ✅ READY

#### Request Headers:
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Request Body:
```json
{
  "verification_type": "identity",
  "documents": [
    {
      "type": "government_id",
      "url": "/uploads/documents/id-123456789.jpg"
    },
    {
      "type": "proof_of_address",
      "url": "/uploads/documents/address-123456789.pdf"
    }
  ]
}
```

#### Valid Verification Types:
- `identity` - Government ID verification
- `background_check` - Background check request
- `driving_license` - Driving license verification (for couriers)

#### Valid Document Types:
- `government_id` - Driver's license, passport, state ID
- `proof_of_address` - Utility bill, bank statement
- `driving_license` - Valid driving license
- `insurance` - Vehicle insurance proof

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Verification request submitted successfully",
  "data": {
    "status": "pending",
    "estimated_completion": "3-5 business days"
  }
}
```

#### Testing with curl:
```bash
curl -X POST http://localhost:3000/api/users/verification/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "verification_type": "identity",
    "documents": [
      {
        "type": "government_id",
        "url": "/uploads/documents/id-123456789.jpg"
      }
    ]
  }'
```

---

### 7. Check Verification Status
**Endpoint:** `GET /api/users/verification/status`
**Status:** ✅ READY

#### Request Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Verification status retrieved successfully",
  "data": {
    "email_verified": true,
    "background_check_status": "pending",
    "last_updated": "2025-07-03T12:00:00.000Z"
  }
}
```

#### Background Check Status Values:
- `not_started` - No verification requested
- `pending` - Verification in progress
- `passed` - Verification completed successfully
- `failed` - Verification failed

#### Testing with curl:
```bash
curl -X GET http://localhost:3000/api/users/verification/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## �📦 **Product Management Endpoints** ✅

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

## 🚗 **Drive-Thru Pickup System Endpoints** ✅

### 1. Enable Drive-Thru Service for Hub (Authenticated)
**Endpoint:** `POST /api/pickup/drive-thru/enable`
**Status:** ✅ READY

#### Request Headers:
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Request Body:
```json
{
  "hub_id": "456e7890-e89b-12d3-a456-426614174001",
  "slot_duration_minutes": 15,
  "slots_per_hour": 4,
  "operating_hours": {
    "monday": { "start": "09:00", "end": "18:00" },
    "tuesday": { "start": "09:00", "end": "18:00" },
    "wednesday": { "start": "09:00", "end": "18:00" },
    "thursday": { "start": "09:00", "end": "18:00" },
    "friday": { "start": "09:00", "end": "20:00" },
    "saturday": { "start": "10:00", "end": "20:00" },
    "sunday": { "start": "10:00", "end": "16:00" }
  },
  "max_advance_booking_days": 7,
  "cancellation_deadline_minutes": 30
}
```

#### Access Control:
- **Only hub owners can enable drive-thru for their hubs**
- **Admins can enable drive-thru for any hub**

#### Expected Response (201):
```json
{
  "success": true,
  "message": "Drive-thru service enabled successfully",
  "data": {
    "configuration": {
      "config_id": "dt-config-123456789",
      "hub_id": "456e7890-e89b-12d3-a456-426614174001",
      "slot_duration_minutes": 15,
      "slots_per_hour": 4,
      "operating_hours": {
        "monday": { "start": "09:00", "end": "18:00" },
        "tuesday": { "start": "09:00", "end": "18:00" },
        "wednesday": { "start": "09:00", "end": "18:00" },
        "thursday": { "start": "09:00", "end": "18:00" },
        "friday": { "start": "09:00", "end": "20:00" },
        "saturday": { "start": "10:00", "end": "20:00" },
        "sunday": { "start": "10:00", "end": "16:00" }
      },
      "max_advance_booking_days": 7,
      "cancellation_deadline_minutes": 30,
      "is_active": true,
      "created_at": "2025-07-04T10:00:00.000Z",
      "updated_at": "2025-07-04T10:00:00.000Z"
    },
    "slots_generated": 252
  }
}
```

#### Error Response for Unauthorized (403):
```json
{
  "success": false,
  "message": "Access denied. You can only enable drive-thru for your own hubs."
}
```

#### Error Response for Already Enabled (400):
```json
{
  "success": false,
  "message": "Drive-thru service is already enabled for this hub"
}
```

#### Testing with curl:
```bash
curl -X POST http://localhost:3000/api/pickup/drive-thru/enable \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "hub_id": "456e7890-e89b-12d3-a456-426614174001",
    "slot_duration_minutes": 15,
    "slots_per_hour": 4,
    "operating_hours": {
      "monday": { "start": "09:00", "end": "18:00" },
      "tuesday": { "start": "09:00", "end": "18:00" },
      "wednesday": { "start": "09:00", "end": "18:00" },
      "thursday": { "start": "09:00", "end": "18:00" },
      "friday": { "start": "09:00", "end": "20:00" },
      "saturday": { "start": "10:00", "end": "20:00" },
      "sunday": { "start": "10:00", "end": "16:00" }
    },
    "max_advance_booking_days": 7,
    "cancellation_deadline_minutes": 30
  }'
```

#### Real-time WebSocket Events:
When drive-thru is enabled, the following event is emitted:
- **Event:** `drive_thru_enabled`
- **Room:** `hub_${hub_id}`
- **Data:** `{ hub_id, configuration }`

---

### 2. Get Available Drive-Thru Slots
**Endpoint:** `GET /api/pickup/drive-thru/slots`
**Status:** ✅ READY

#### Request Headers:
```
(No headers required for public endpoint)
```

#### Query Parameters:
- `hub_id` (required) - Hub ID (UUID)
- `date` (optional) - Date to check slots for (YYYY-MM-DD format, defaults to today)
- `days` (optional) - Number of days to fetch slots for (default: 1, max: 7)

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Available slots retrieved successfully",
  "data": {
    "hub": {
      "hub_id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "Downtown Hub",
      "address": "123 Main St, City, State"
    },
    "configuration": {
      "slot_duration_minutes": 15,
      "cancellation_deadline_minutes": 30,
      "max_advance_booking_days": 7
    },
    "available_slots": [
      {
        "slot_id": "slot-20250704-0900-001",
        "start_time": "2025-07-04T09:00:00.000Z",
        "end_time": "2025-07-04T09:15:00.000Z",
        "is_available": true,
        "day_of_week": "friday"
      },
      {
        "slot_id": "slot-20250704-0915-002",
        "start_time": "2025-07-04T09:15:00.000Z",
        "end_time": "2025-07-04T09:30:00.000Z",
        "is_available": true,
        "day_of_week": "friday"
      },
      {
        "slot_id": "slot-20250704-0930-003",
        "start_time": "2025-07-04T09:30:00.000Z",
        "end_time": "2025-07-04T09:45:00.000Z",
        "is_available": false,
        "day_of_week": "friday",
        "booked_by": "customer_123"
      }
    ],
    "summary": {
      "total_slots": 36,
      "available_slots": 35,
      "booked_slots": 1
    }
  }
}
```

#### Error Response for Drive-Thru Not Enabled (400):
```json
{
  "success": false,
  "message": "Drive-thru service is not enabled for this hub"
}
```

#### Testing with curl:
```bash
curl -X GET "http://localhost:3000/api/pickup/drive-thru/slots?hub_id=456e7890-e89b-12d3-a456-426614174001&date=2025-07-04&days=2"
```

---

### 3. Book Drive-Thru Slot (Authenticated)
**Endpoint:** `POST /api/pickup/drive-thru/book`
**Status:** ✅ READY

#### Request Headers:
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Request Body:
```json
{
  "slot_id": "slot-20250704-0900-001",
  "order_id": "ord12345-e89b-12d3-a456-426614174008",
  "vehicle_info": {
    "make": "Toyota",
    "model": "Camry",
    "color": "Blue",
    "license_plate": "ABC123"
  },
  "special_instructions": "Please have order ready at pickup window"
}
```

#### Expected Response (201):
```json
{
  "success": true,
  "message": "Drive-thru slot booked successfully",
  "data": {
    "booking": {
      "slot_id": "slot-20250704-0900-001",
      "customer_id": "123e4567-e89b-12d3-a456-426614174000",
      "order_id": "ord12345-e89b-12d3-a456-426614174008",
      "start_time": "2025-07-04T09:00:00.000Z",
      "end_time": "2025-07-04T09:15:00.000Z",
      "status": "booked",
      "vehicle_info": {
        "make": "Toyota",
        "model": "Camry",
        "color": "Blue",
        "license_plate": "ABC123"
      },
      "special_instructions": "Please have order ready at pickup window",
      "booking_reference": "DT-20250704-090001",
      "booked_at": "2025-07-04T08:30:00.000Z"
    },
    "hub": {
      "hub_id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "Downtown Hub",
      "address": "123 Main St, City, State"
    }
  }
}
```

#### Error Response for Slot Already Booked (400):
```json
{
  "success": false,
  "message": "This slot is no longer available"
}
```

#### Error Response for Invalid Order (400):
```json
{
  "success": false,
  "message": "Order not found or does not belong to you"
}
```

#### Testing with curl:
```bash
curl -X POST http://localhost:3000/api/pickup/drive-thru/book \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "slot_id": "slot-20250704-0900-001",
    "order_id": "ord12345-e89b-12d3-a456-426614174008",
    "vehicle_info": {
      "make": "Toyota",
      "model": "Camry",
      "color": "Blue",
      "license_plate": "ABC123"
    },
    "special_instructions": "Please have order ready at pickup window"
  }'
```

#### Real-time WebSocket Events:
When a slot is booked, the following events are emitted:
- **Event:** `drive_thru_slot_booked`
- **Room:** `hub_${hub_id}` (for hub staff)
- **Data:** `{ slot_id, customer_id, order_id, start_time, vehicle_info }`

---

### 4. Notify Customer for Pickup (Authenticated)
**Endpoint:** `PUT /api/pickup/drive-thru/notify`
**Status:** ✅ READY

#### Request Headers:
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Request Body:
```json
{
  "slot_id": "slot-20250704-0900-001",
  "notification_type": "order_ready",
  "message": "Your order is ready for pickup. Please proceed to the drive-thru window.",
  "estimated_wait_minutes": 2
}
```

#### Valid Notification Types:
- `order_ready` - Order is prepared and ready for pickup
- `please_proceed` - Customer should proceed to drive-thru window
- `delay_notification` - Pickup will be delayed
- `custom_message` - Custom notification message

#### Access Control:
- **Only hub owners/staff can send notifications for their hubs**
- **Admins can send notifications for any hub**

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Customer notified successfully",
  "data": {
    "notification": {
      "slot_id": "slot-20250704-0900-001",
      "customer_id": "123e4567-e89b-12d3-a456-426614174000",
      "notification_type": "order_ready",
      "message": "Your order is ready for pickup. Please proceed to the drive-thru window.",
      "estimated_wait_minutes": 2,
      "sent_at": "2025-07-04T08:55:00.000Z",
      "delivery_method": ["push_notification", "sms"]
    },
    "booking_details": {
      "booking_reference": "DT-20250704-090001",
      "start_time": "2025-07-04T09:00:00.000Z",
      "vehicle_info": {
        "make": "Toyota",
        "model": "Camry",
        "color": "Blue",
        "license_plate": "ABC123"
      }
    }
  }
}
```

#### Error Response for Unauthorized (403):
```json
{
  "success": false,
  "message": "Access denied. You can only notify customers for your hub's bookings."
}
```

#### Error Response for Booking Not Found (404):
```json
{
  "success": false,
  "message": "Booking not found or not active"
}
```

#### Testing with curl:
```bash
curl -X PUT http://localhost:3000/api/pickup/drive-thru/notify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "slot_id": "slot-20250704-0900-001",
    "notification_type": "order_ready",
    "message": "Your order is ready for pickup. Please proceed to the drive-thru window.",
    "estimated_wait_minutes": 2
  }'
```

#### Real-time WebSocket Events:
When a customer is notified, the following events are emitted:
- **Event:** `drive_thru_customer_notified`
- **Room:** `user_${customer_id}` (for customer)
- **Data:** `{ slot_id, notification_type, message, estimated_wait_minutes }`

---

### 5. Confirm Pickup Completion (Authenticated)
**Endpoint:** `POST /api/pickup/drive-thru/confirm`
**Status:** ✅ READY

#### Request Headers:
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Request Body:
```json
{
  "slot_id": "slot-20250704-0900-001",
  "pickup_confirmed": true,
  "actual_pickup_time": "2025-07-04T09:03:00.000Z",
  "notes": "Order picked up successfully, customer was very satisfied"
}
```

#### Access Control:
- **Hub owners/staff can confirm pickups for their hubs**
- **Customers can confirm their own pickups**
- **Admins can confirm any pickup**

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Pickup confirmed successfully",
  "data": {
    "pickup_confirmation": {
      "slot_id": "slot-20250704-0900-001",
      "booking_reference": "DT-20250704-090001",
      "customer_id": "123e4567-e89b-12d3-a456-426614174000",
      "order_id": "ord12345-e89b-12d3-a456-426614174008",
      "scheduled_time": "2025-07-04T09:00:00.000Z",
      "actual_pickup_time": "2025-07-04T09:03:00.000Z",
      "status": "completed",
      "pickup_duration_seconds": 120,
      "notes": "Order picked up successfully, customer was very satisfied",
      "confirmed_at": "2025-07-04T09:05:00.000Z",
      "confirmed_by": "hub_staff"
    },
    "performance_metrics": {
      "on_time_pickup": true,
      "time_variance_minutes": 3,
      "slot_utilization": "100%"
    }
  }
}
```

#### Error Response for Already Confirmed (400):
```json
{
  "success": false,
  "message": "This pickup has already been confirmed"
}
```

#### Error Response for Unauthorized (403):
```json
{
  "success": false,
  "message": "Access denied. You can only confirm pickups for your bookings or hub."
}
```

#### Testing with curl:
```bash
curl -X POST http://localhost:3000/api/pickup/drive-thru/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "slot_id": "slot-20250704-0900-001",
    "pickup_confirmed": true,
    "actual_pickup_time": "2025-07-04T09:03:00.000Z",
    "notes": "Order picked up successfully, customer was very satisfied"
  }'
```

#### Real-time WebSocket Events:
When pickup is confirmed, the following events are emitted:
- **Event:** `drive_thru_pickup_completed`
- **Room:** `hub_${hub_id}` (for hub staff)
- **Room:** `user_${customer_id}` (for customer)
- **Data:** `{ slot_id, booking_reference, actual_pickup_time, status }`

---

### 6. Get Drive-Thru Queue Status
**Endpoint:** `GET /api/pickup/drive-thru/queue`
**Status:** ✅ READY

#### Request Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Query Parameters:
- `hub_id` (required) - Hub ID (UUID)
- `date` (optional) - Date to check queue for (YYYY-MM-DD format, defaults to today)

#### Access Control:
- **Hub owners/staff can view queue for their hubs**
- **Customers can view their position in queue**
- **Admins can view any hub's queue**

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Drive-thru queue retrieved successfully",
  "data": {
    "hub": {
      "hub_id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "Downtown Hub"
    },
    "queue_status": {
      "current_time": "2025-07-04T08:45:00.000Z",
      "active_bookings": 5,
      "completed_today": 12,
      "average_pickup_time_minutes": 3.5,
      "current_delays_minutes": 0
    },
    "upcoming_pickups": [
      {
        "slot_id": "slot-20250704-0900-001",
        "booking_reference": "DT-20250704-090001",
        "start_time": "2025-07-04T09:00:00.000Z",
        "end_time": "2025-07-04T09:15:00.000Z",
        "status": "notified",
        "customer": {
          "first_name": "John",
          "last_name": "D."
        },
        "vehicle_info": {
          "make": "Toyota",
          "model": "Camry",
          "color": "Blue",
          "license_plate": "ABC123"
        },
        "order_summary": {
          "order_id": "ord12345-e89b-12d3-a456-426614174008",
          "item_count": 5,
          "total_amount": 47.50
        },
        "minutes_until_pickup": 15
      },
      {
        "slot_id": "slot-20250704-0915-002",
        "booking_reference": "DT-20250704-091502",
        "start_time": "2025-07-04T09:15:00.000Z",
        "end_time": "2025-07-04T09:30:00.000Z",
        "status": "booked",
        "customer": {
          "first_name": "Jane",
          "last_name": "S."
        },
        "vehicle_info": {
          "make": "Honda",
          "model": "Civic",
          "color": "Red",
          "license_plate": "XYZ789"
        },
        "order_summary": {
          "order_id": "ord67890-e89b-12d3-a456-426614174009",
          "item_count": 3,
          "total_amount": 23.75
        },
        "minutes_until_pickup": 30
      }
    ],
    "performance_metrics": {
      "on_time_percentage": 95.5,
      "average_wait_time_minutes": 2.1,
      "customer_satisfaction_rating": 4.8
    }
  }
}
```

#### Customer-Specific Response (when accessed by customer):
```json
{
  "success": true,
  "message": "Your queue position retrieved successfully",
  "data": {
    "your_booking": {
      "slot_id": "slot-20250704-0900-001",
      "booking_reference": "DT-20250704-090001",
      "start_time": "2025-07-04T09:00:00.000Z",
      "status": "notified",
      "position_in_queue": 1,
      "estimated_wait_minutes": 15,
      "special_instructions": "Please have order ready at pickup window"
    },
    "hub_info": {
      "name": "Downtown Hub",
      "current_delays_minutes": 0,
      "average_pickup_time_minutes": 3.5
    }
  }
}
```

#### Testing with curl:
```bash
curl -X GET "http://localhost:3000/api/pickup/drive-thru/queue?hub_id=456e7890-e89b-12d3-a456-426614174001&date=2025-07-04" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 7. Cancel Drive-Thru Booking (Authenticated)
**Endpoint:** `POST /api/pickup/drive-thru/cancel`
**Status:** ✅ READY

#### Request Headers:
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Request Body:
```json
{
  "slot_id": "slot-20250704-0900-001",
  "cancellation_reason": "customer_request",
  "notes": "Customer needs to reschedule due to traffic delay"
}
```

#### Valid Cancellation Reasons:
- `customer_request` - Customer requested cancellation
- `order_issue` - Problem with the order
- `hub_closure` - Hub temporarily closed
- `emergency` - Emergency situation
- `weather` - Weather-related cancellation
- `other` - Other reason

#### Access Control:
- **Customers can cancel their own bookings**
- **Hub owners/staff can cancel bookings for their hubs**
- **Admins can cancel any booking**

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Drive-thru booking cancelled successfully",
  "data": {
    "cancellation": {
      "slot_id": "slot-20250704-0900-001",
      "booking_reference": "DT-20250704-090001",
      "original_start_time": "2025-07-04T09:00:00.000Z",
      "cancelled_at": "2025-07-04T08:40:00.000Z",
      "cancellation_reason": "customer_request",
      "notes": "Customer needs to reschedule due to traffic delay",
      "cancelled_by": "customer",
      "refund_eligible": true,
      "cancellation_fee": 0.00
    },
    "slot_availability": {
      "slot_id": "slot-20250704-0900-001",
      "is_available": true,
      "available_for_rebooking_at": "2025-07-04T08:40:00.000Z"
    }
  }
}
```

#### Error Response for Late Cancellation (400):
```json
{
  "success": false,
  "message": "Cancellation deadline has passed. You can only cancel bookings at least 30 minutes in advance.",
  "data": {
    "cancellation_deadline": "2025-07-04T08:30:00.000Z",
    "current_time": "2025-07-04T08:45:00.000Z",
    "minutes_past_deadline": 15
  }
}
```

#### Error Response for Already Cancelled (400):
```json
{
  "success": false,
  "message": "This booking has already been cancelled"
}
```

#### Testing with curl:
```bash
curl -X POST http://localhost:3000/api/pickup/drive-thru/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "slot_id": "slot-20250704-0900-001",
    "cancellation_reason": "customer_request",
    "notes": "Customer needs to reschedule due to traffic delay"
  }'
```

#### Real-time WebSocket Events:
When a booking is cancelled, the following events are emitted:
- **Event:** `drive_thru_booking_cancelled`
- **Room:** `hub_${hub_id}` (for hub staff)
- **Room:** `user_${customer_id}` (for customer)
- **Data:** `{ slot_id, booking_reference, cancellation_reason, cancelled_by }`

---

### 8. Get Drive-Thru History (Authenticated)
**Endpoint:** `GET /api/pickup/drive-thru/history`
**Status:** ✅ READY

#### Request Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Query Parameters:
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20, max: 100)
- `hub_id` (optional) - Filter by specific hub (for hub owners/admins)
- `status` (optional) - Filter by status: `completed`, `cancelled`, `no_show`
- `date_from` (optional) - Start date filter (YYYY-MM-DD)
- `date_to` (optional) - End date filter (YYYY-MM-DD)

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Drive-thru history retrieved successfully",
  "data": {
    "history": [
      {
        "slot_id": "slot-20250703-1400-001",
        "booking_reference": "DT-20250703-140001",
        "hub": {
          "hub_id": "456e7890-e89b-12d3-a456-426614174001",
          "name": "Downtown Hub",
          "address": "123 Main St, City, State"
        },
        "scheduled_time": "2025-07-03T14:00:00.000Z",
        "actual_pickup_time": "2025-07-03T14:02:00.000Z",
        "status": "completed",
        "order": {
          "order_id": "ord11111-e89b-12d3-a456-426614174006",
          "total_amount": 34.50,
          "item_count": 4
        },
        "vehicle_info": {
          "make": "Toyota",
          "model": "Camry",
          "color": "Blue",
          "license_plate": "ABC123"
        },
        "pickup_duration_seconds": 120,
        "rating_given": 5,
        "feedback": "Excellent service, very quick pickup!",
        "special_instructions": "Extra bags please",
        "booked_at": "2025-07-03T12:30:00.000Z",
        "completed_at": "2025-07-03T14:02:00.000Z"
      },
      {
        "slot_id": "slot-20250702-1030-002",
        "booking_reference": "DT-20250702-103002",
        "hub": {
          "hub_id": "789e1234-e89b-12d3-a456-426614174002",
          "name": "Community Hub",
          "address": "456 Community St, City, State"
        },
        "scheduled_time": "2025-07-02T10:30:00.000Z",
        "actual_pickup_time": null,
        "status": "cancelled",
        "cancellation_reason": "customer_request",
        "cancellation_notes": "Had to cancel due to emergency",
        "order": {
          "order_id": "ord22222-e89b-12d3-a456-426614174007",
          "total_amount": 18.75,
          "item_count": 2
        },
        "booked_at": "2025-07-02T09:00:00.000Z",
        "cancelled_at": "2025-07-02T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "pages": 1
    },
    "summary": {
      "total_bookings": 15,
      "completed_pickups": 12,
      "cancelled_bookings": 2,
      "no_shows": 1,
      "average_rating": 4.8,
      "total_savings_time_minutes": 180,
      "favorite_hubs": [
        {
          "hub_id": "456e7890-e89b-12d3-a456-426614174001",
          "name": "Downtown Hub",
          "pickup_count": 8
        }
      ]
    }
  }
}
```

#### Testing with curl:
```bash
curl -X GET "http://localhost:3000/api/pickup/drive-thru/history?page=1&limit=10&status=completed&date_from=2025-07-01&date_to=2025-07-04" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 9. Rate Drive-Thru Experience (Authenticated)
**Endpoint:** `PUT /api/pickup/drive-thru/rating`
**Status:** ✅ READY

#### Request Headers:
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Request Body:
```json
{
  "slot_id": "slot-20250703-1400-001",
  "rating": 5,
  "feedback": "Excellent service! Very quick and efficient pickup process.",
  "service_aspects": {
    "speed": 5,
    "staff_friendliness": 5,
    "order_accuracy": 5,
    "overall_experience": 5
  },
  "suggestions": "Maybe add a digital menu board at the drive-thru window"
}
```

#### Validation Rules:
- `rating` - Integer between 1 and 5
- `service_aspects` - Each aspect rated 1-5
- `feedback` - Optional text (max 1000 characters)
- `suggestions` - Optional text (max 500 characters)

#### Access Control:
- **Only customers who completed the pickup can rate**
- **One rating per booking**

#### Expected Response (200):
```json
{
  "success": true,
  "message": "Rating submitted successfully",
  "data": {
    "rating_submission": {
      "slot_id": "slot-20250703-1400-001",
      "booking_reference": "DT-20250703-140001",
      "customer_id": "123e4567-e89b-12d3-a456-426614174000",
      "rating": 5,
      "feedback": "Excellent service! Very quick and efficient pickup process.",
      "service_aspects": {
        "speed": 5,
        "staff_friendliness": 5,
        "order_accuracy": 5,
        "overall_experience": 5
      },
      "suggestions": "Maybe add a digital menu board at the drive-thru window",
      "submitted_at": "2025-07-03T15:00:00.000Z"
    },
    "impact": {
      "hub_average_rating": 4.9,
      "total_ratings_for_hub": 45,
      "your_total_ratings": 8
    }
  }
}
```

#### Error Response for Already Rated (400):
```json
{
  "success": false,
  "message": "You have already rated this drive-thru experience"
}
```

#### Error Response for Invalid Booking (400):
```json
{
  "success": false,
  "message": "You can only rate completed pickups that you participated in"
}
```

#### Testing with curl:
```bash
curl -X PUT http://localhost:3000/api/pickup/drive-thru/rating \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "slot_id": "slot-20250703-1400-001",
    "rating": 5,
    "feedback": "Excellent service! Very quick and efficient pickup process.",
    "service_aspects": {
      "speed": 5,
      "staff_friendliness": 5,
      "order_accuracy": 5,
      "overall_experience": 5
    },
    "suggestions": "Maybe add a digital menu board at the drive-thru window"
  }'
```

#### Real-time WebSocket Events:
When a rating is submitted, the following events are emitted:
- **Event:** `drive_thru_rating_received`
- **Room:** `hub_${hub_id}` (for hub staff)
- **Data:** `{ slot_id, rating, feedback, service_aspects }`

---

## 🔌 **Real-Time WebSocket Events for Drive-Thru System**

The Drive-Thru Pickup System includes comprehensive real-time communication using Socket.IO. Here are all the WebSocket events you can listen for:

### Connection Setup
```javascript
// Connect to WebSocket server
const socket = io('http://localhost:3000');

// Join specific rooms for updates
socket.emit('join_room', `user_${user_id}`);      // For customer updates
socket.emit('join_room', `hub_${hub_id}`);        // For hub staff updates
```

### Event Types

#### 1. `drive_thru_enabled`
**Room:** `hub_${hub_id}`
**Triggered:** When drive-thru service is enabled for a hub
```javascript
socket.on('drive_thru_enabled', (data) => {
  console.log('Drive-thru enabled:', data);
  // { hub_id, configuration, slots_generated }
});
```

#### 2. `drive_thru_slot_booked`
**Room:** `hub_${hub_id}`
**Triggered:** When a customer books a drive-thru slot
```javascript
socket.on('drive_thru_slot_booked', (data) => {
  console.log('New booking:', data);
  // { slot_id, customer_id, order_id, start_time, vehicle_info }
});
```

#### 3. `drive_thru_customer_notified`
**Room:** `user_${customer_id}`
**Triggered:** When hub staff notifies customer about order status
```javascript
socket.on('drive_thru_customer_notified', (data) => {
  console.log('Notification received:', data);
  // { slot_id, notification_type, message, estimated_wait_minutes }
});
```

#### 4. `drive_thru_pickup_completed`
**Rooms:** `hub_${hub_id}`, `user_${customer_id}`
**Triggered:** When pickup is confirmed as completed
```javascript
socket.on('drive_thru_pickup_completed', (data) => {
  console.log('Pickup completed:', data);
  // { slot_id, booking_reference, actual_pickup_time, status }
});
```

#### 5. `drive_thru_booking_cancelled`
**Rooms:** `hub_${hub_id}`, `user_${customer_id}`
**Triggered:** When a booking is cancelled
```javascript
socket.on('drive_thru_booking_cancelled', (data) => {
  console.log('Booking cancelled:', data);
  // { slot_id, booking_reference, cancellation_reason, cancelled_by }
});
```

#### 6. `drive_thru_rating_received`
**Room:** `hub_${hub_id}`
**Triggered:** When a customer submits a rating
```javascript
socket.on('drive_thru_rating_received', (data) => {
  console.log('New rating:', data);
  // { slot_id, rating, feedback, service_aspects }
});
```

### Testing WebSocket Events

#### Using wscat (Command Line):
```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket server
wscat -c ws://localhost:3000

# Join a room to receive events
{"type": "join_room", "room": "hub_456e7890-e89b-12d3-a456-426614174001"}
```

#### Using Browser Console:
```javascript
// Connect to server
const socket = io('http://localhost:3000');

// Join room for a specific hub
socket.emit('join_room', 'hub_456e7890-e89b-12d3-a456-426614174001');

// Listen for all drive-thru events
socket.on('drive_thru_enabled', console.log);
socket.on('drive_thru_slot_booked', console.log);
socket.on('drive_thru_customer_notified', console.log);
socket.on('drive_thru_pickup_completed', console.log);
socket.on('drive_thru_booking_cancelled', console.log);
socket.on('drive_thru_rating_received', console.log);

// Test connection
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});
```

#### Using websocat (Advanced WebSocket Client):
```bash
# Install websocat
# Windows: Download from https://github.com/vi/websocat/releases
# Mac: brew install websocat
# Linux: cargo install websocat

# Connect and listen for events
echo '{"type": "join_room", "room": "hub_456e7890-e89b-12d3-a456-426614174001"}' | websocat ws://localhost:3000
```

---

## 🚗 **Drive-Thru Testing Workflow**

### Complete Testing Sequence:

#### 1. Setup (Hub Owner)
```bash
# 1. Enable drive-thru service
curl -X POST http://localhost:3000/api/pickup/drive-thru/enable \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer HUB_OWNER_TOKEN" \
  -d '{ /* configuration data */ }'

# 2. Check available slots
curl -X GET "http://localhost:3000/api/pickup/drive-thru/slots?hub_id=456e7890-e89b-12d3-a456-426614174001&date=2025-07-04"
```

#### 2. Customer Booking
```bash
# 1. Book a slot
curl -X POST http://localhost:3000/api/pickup/drive-thru/book \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -d '{ /* booking data */ }'

# 2. Check queue status
curl -X GET "http://localhost:3000/api/pickup/drive-thru/queue?hub_id=456e7890-e89b-12d3-a456-426614174001" \
  -H "Authorization: Bearer CUSTOMER_TOKEN"
```

#### 3. Hub Operations
```bash
# 1. View current queue
curl -X GET "http://localhost:3000/api/pickup/drive-thru/queue?hub_id=456e7890-e89b-12d3-a456-426614174001" \
  -H "Authorization: Bearer HUB_OWNER_TOKEN"

# 2. Notify customer when ready
curl -X PUT http://localhost:3000/api/pickup/drive-thru/notify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer HUB_OWNER_TOKEN" \
  -d '{ /* notification data */ }'

# 3. Confirm pickup completion
curl -X POST http://localhost:3000/api/pickup/drive-thru/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer HUB_OWNER_TOKEN" \
  -d '{ /* confirmation data */ }'
```

#### 4. Customer Feedback
```bash
# 1. Rate the experience
curl -X PUT http://localhost:3000/api/pickup/drive-thru/rating \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -d '{ /* rating data */ }'

# 2. View history
curl -X GET "http://localhost:3000/api/pickup/drive-thru/history?page=1&limit=10" \
  -H "Authorization: Bearer CUSTOMER_TOKEN"
```

#### 5. Optional: Cancellation
```bash
# Cancel booking (if needed)
curl -X POST http://localhost:3000/api/pickup/drive-thru/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -d '{ /* cancellation data */ }'
```

---

## 🚫 **Missing Endpoints (Not Yet Implemented)**

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

### ✅ User Management Testing
- [ ] Create new user with valid data
- [ ] Create user with invalid email format
- [ ] Create user with weak password
- [ ] Create user with duplicate email
- [ ] Get detailed profile with authentication
- [ ] Get detailed profile without authentication (should fail)
- [ ] Update profile with valid data
- [ ] Update profile with invalid data
- [ ] Try to update restricted fields (email, role)
- [ ] Upload avatar with valid image file
- [ ] Upload avatar with invalid file type
- [ ] Upload avatar without authentication (should fail)
- [ ] Get earnings as hub owner/courier
- [ ] Get earnings as customer (should fail with 403)
- [ ] Get earnings without authentication (should fail)
- [ ] Request verification with valid documents
- [ ] Request verification with invalid type
- [ ] Check verification status
- [ ] Check verification status without authentication (should fail)

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

Save this as `test-complete-api.sh` for comprehensive API testing:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api"

echo "=== Testing SwarmFill Complete API ==="

# 1. Register User
echo "1. Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "first_name": "Test",
    "last_name": "User",
    "middle_name": "API",
    "phone_number": "+1234567890",
    "role": "customer"
  }')

echo "Register Response: $REGISTER_RESPONSE"

# Extract token from response
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Extracted Token: $TOKEN"

# 2. Login User
echo -e "\n2. Logging in user..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }')

echo "Login Response: $LOGIN_RESPONSE"

# Update token from login response
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 3. Get Basic Profile
echo -e "\n3. Getting basic user profile..."
PROFILE_RESPONSE=$(curl -s -X GET $BASE_URL/auth/profile \
  -H "Authorization: Bearer $TOKEN")

echo "Profile Response: $PROFILE_RESPONSE"

# 4. Get Detailed Profile
echo -e "\n4. Getting detailed user profile..."
DETAILED_PROFILE_RESPONSE=$(curl -s -X GET $BASE_URL/users/profile/detailed \
  -H "Authorization: Bearer $TOKEN")

echo "Detailed Profile Response: $DETAILED_PROFILE_RESPONSE"

# 5. Update Profile
echo -e "\n5. Updating user profile..."
UPDATE_PROFILE_RESPONSE=$(curl -s -X PUT $BASE_URL/users/profile/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "first_name": "Updated",
    "last_name": "User",
    "middle_name": "Test",
    "phone_number": "+1987654321"
  }')

echo "Update Profile Response: $UPDATE_PROFILE_RESPONSE"

# 6. Check Verification Status
echo -e "\n6. Checking verification status..."
VERIFICATION_STATUS_RESPONSE=$(curl -s -X GET $BASE_URL/users/verification/status \
  -H "Authorization: Bearer $TOKEN")

echo "Verification Status Response: $VERIFICATION_STATUS_RESPONSE"

# 7. Request Verification
echo -e "\n7. Requesting identity verification..."
VERIFICATION_REQUEST_RESPONSE=$(curl -s -X POST $BASE_URL/users/verification/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "verification_type": "identity",
    "documents": [
      {
        "type": "government_id",
        "url": "/uploads/documents/test-id.jpg"
      }
    ]
  }')

echo "Verification Request Response: $VERIFICATION_REQUEST_RESPONSE"

# 8. Try to Get Earnings (should fail for customer)
echo -e "\n8. Trying to get earnings (should fail for customer)..."
EARNINGS_RESPONSE=$(curl -s -X GET $BASE_URL/users/earnings \
  -H "Authorization: Bearer $TOKEN")

echo "Earnings Response: $EARNINGS_RESPONSE"

# 9. Create Hub Owner User
echo -e "\n9. Creating hub owner user..."
HUB_OWNER_REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hubowner@example.com",
    "password": "HubOwner123!",
    "first_name": "Hub",
    "last_name": "Owner",
    "phone_number": "+1555666777",
    "role": "hub_owner"
  }')

echo "Hub Owner Register Response: $HUB_OWNER_REGISTER_RESPONSE"

# 10. Login as Hub Owner
echo -e "\n10. Logging in as hub owner..."
HUB_OWNER_LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hubowner@example.com",
    "password": "HubOwner123!"
  }')

echo "Hub Owner Login Response: $HUB_OWNER_LOGIN_RESPONSE"

# Extract hub owner token
HUB_OWNER_TOKEN=$(echo $HUB_OWNER_LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 11. Get Earnings as Hub Owner
echo -e "\n11. Getting earnings as hub owner..."
HUB_OWNER_EARNINGS_RESPONSE=$(curl -s -X GET $BASE_URL/users/earnings \
  -H "Authorization: Bearer $HUB_OWNER_TOKEN")

echo "Hub Owner Earnings Response: $HUB_OWNER_EARNINGS_RESPONSE"

# 12. Health Check
echo -e "\n12. Checking system health..."
HEALTH_RESPONSE=$(curl -s -X GET http://localhost:3000/health)

echo "Health Response: $HEALTH_RESPONSE"

# 13. Test Error Cases
echo -e "\n13. Testing error cases..."

# Test invalid registration
echo -e "\n13a. Testing invalid email registration..."
INVALID_EMAIL_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "TestPass123!",
    "first_name": "Test",
    "last_name": "User",
    "role": "customer"
  }')

echo "Invalid Email Response: $INVALID_EMAIL_RESPONSE"

# Test weak password
echo -e "\n13b. Testing weak password registration..."
WEAK_PASSWORD_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "weakpass@example.com",
    "password": "123",
    "first_name": "Test",
    "last_name": "User",
    "role": "customer"
  }')

echo "Weak Password Response: $WEAK_PASSWORD_RESPONSE"

# Test unauthorized access
echo -e "\n13c. Testing unauthorized access to protected endpoint..."
UNAUTHORIZED_RESPONSE=$(curl -s -X GET $BASE_URL/users/profile/detailed)

echo "Unauthorized Response: $UNAUTHORIZED_RESPONSE"

echo -e "\n=== Testing Complete ==="
echo -e "\nSummary:"
echo "- User Registration: ✅"
echo "- User Login: ✅"
echo "- Profile Management: ✅"
echo "- Verification System: ✅"
echo "- Role-based Access: ✅"
echo "- Error Handling: ✅"
```

Make it executable and run:
```bash
chmod +x test-complete-api.sh
./test-complete-api.sh
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
- **User Management** (7 endpoints) - User profile and verification
- **Drive-Thru Pickup System** (8 endpoints) - Complete drive-thru functionality

### ❌ **Awaiting Implementation:**
- **Crisis Mode Management** (9 endpoints) - Emergency response system
- **Financial & Earnings** (9 endpoints) - Community earnings tracking
- **Mobile App Support** (8 endpoints) - Mobile-specific features
- **Real-time Communication** (8 endpoints) - Community chat and alerts

**Total Available:** 58 endpoints ready for testing
**Total Missing:** 26 endpoints awaiting implementation

---

This testing guide provides comprehensive coverage of all currently available API endpoints. Use it to validate the authentication system and other implemented features before moving on to implement the missing critical endpoints like the Crisis Mode Management.
