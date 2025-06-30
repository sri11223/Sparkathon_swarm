# SwarmFill Backend API Documentation

## Overview
The SwarmFill Backend API provides comprehensive endpoints for managing the logistics and supply chain network. It supports multiple user types: customers, hub owners, couriers, and administrators.

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.swarmfill.com/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this standard format:
```json
{
  "success": boolean,
  "message": "string",
  "data": object | array,
  "error": "string" // Only in error responses
}
```

## Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "user_type": "customer|hubowner|courier",
  "address": "123 Main St, City, State",
  "latitude": 40.7128,
  "longitude": -74.0060,
  // For couriers only:
  "vehicle_type": "bike|car|van|truck",
  "license_number": "ABC123"
}
```

### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### GET /auth/verify-email/:token
Verify user email address.

### POST /auth/forgot-password
Request password reset email.

### POST /auth/reset-password/:token
Reset password using token.

### POST /auth/change-password
Change password for authenticated user.

### GET /auth/profile
Get current user profile.

---

## User Management Endpoints

### GET /users/profile
Get current user's profile.

### PUT /users/profile
Update current user's profile.

### GET /users/:id
Get user profile by ID (admin/self only).

### GET /users/orders
Get current user's orders.

### PUT /users/location
Update courier location (couriers only).

### PUT /users/availability
Update courier availability (couriers only).

### GET /users/couriers/nearby
Find nearby available couriers.

---

## Hub Management Endpoints

### GET /hubs
Get all hubs with filtering and pagination.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search in name/address
- `hub_type` - Filter by hub type
- `latitude/longitude/radius` - Location-based filtering

### GET /hubs/:id
Get hub details by ID.

### POST /hubs
Create new hub (hub owners/admin only).

### PUT /hubs/:id
Update hub (hub owners/admin only).

### DELETE /hubs/:id
Delete hub (hub owners/admin only).

### GET /hubs/:id/inventory
Get hub inventory.

### GET /hubs/:id/orders
Get hub orders (hub owners/admin only).

### GET /hubs/my/hubs
Get current user's hubs (hub owners only).

---

## Product Management Endpoints

### GET /products
Get all products with filtering.

**Query Parameters:**
- `page`, `limit` - Pagination
- `search` - Search in name/description
- `category` - Filter by category
- `min_price`, `max_price` - Price range
- `tags` - Filter by tags

### GET /products/:id
Get product details by ID.

### POST /products
Create new product (admin only).

### PUT /products/:id
Update product (admin only).

### DELETE /products/:id
Delete product (admin only).

### GET /products/categories/list
Get all product categories.

### GET /products/search/location
Search products near location.

### GET /products/popular/list
Get popular products.

---

## Inventory Management Endpoints

### POST /hubs/inventory
Add inventory to hub.

### PUT /hubs/inventory/:id
Update inventory item.

### GET /hubs/inventory/:id
Get inventory item details.

### DELETE /hubs/inventory/:id
Remove inventory item.

### GET /hubs/inventory/alerts/low-stock
Get low stock alerts.

### GET /hubs/inventory/summary
Get inventory summary for dashboard.

### POST /hubs/inventory/bulk-update
Bulk update inventory items.

---

## Order Management Endpoints

### GET /orders
Get orders (filtered by user role).

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - Filter by order status
- `start_date`, `end_date` - Date range filter

### POST /orders
Create new order (customers only).

**Request Body:**
```json
{
  "delivery_address": "456 Oak St, City, State",
  "delivery_latitude": 40.7589,
  "delivery_longitude": -73.9851,
  "delivery_instructions": "Ring doorbell",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2,
      "hub_id": "uuid"
    }
  ],
  "preferred_delivery_time": "2024-01-15T14:00:00Z"
}
```

### GET /orders/:id
Get order details by ID.

### PUT /orders/:id/status
Update order status.

### PUT /orders/:id/assign-courier
Assign courier to order.

### PUT /orders/:id/cancel
Cancel order.

---

## AI Integration Endpoints

### POST /ai/route/optimize
Get optimized delivery route.

### GET /ai/demand/predict
Get inventory demand predictions.

### POST /ai/courier/assign
Get optimal courier assignment.

### GET /ai/products/recommend
Get AI product recommendations.

### GET /ai/pricing/optimize
Get price optimization suggestions.

---

## Admin Endpoints

### GET /admin/dashboard
Get admin dashboard statistics.

### GET /admin/users
Get all users with management capabilities.

### PUT /admin/users/:id/status
Update user status (activate/deactivate).

### GET /admin/analytics
Get system analytics and reports.

### GET /admin/system-health
Get system health status.

### GET /admin/export
Export system data.

### POST /admin/cleanup
Clean up old data.

---

## WebSocket Events

The API supports real-time communication via WebSocket for:

### Customer Events
- `order_created` - New order created
- `order_status_updated` - Order status changed
- `delivery_eta_updated` - Estimated delivery time updated

### Courier Events
- `delivery_assigned` - New delivery assigned
- `order_status_updated` - Order status changed
- `location_update` - Location tracking update

### Hub Owner Events
- `new_order` - New order for hub
- `low_stock_alert` - Inventory low stock alert
- `courier_assigned` - Courier assigned to order

### Admin Events
- `system_alert` - System notifications
- `new_user_registration` - New user registered

---

## Rate Limiting
- 100 requests per 15-minute window per IP
- Higher limits for authenticated users
- Special limits for AI endpoints

## Pagination
Most list endpoints support pagination:
- `page` - Page number (starts from 1)
- `limit` - Items per page (max 100)
- Response includes pagination metadata

## Filtering and Sorting
Many endpoints support:
- `search` - Text search
- `sort` - Sort field
- `order` - Sort direction (asc/desc)
- Various filters specific to endpoint

## Status Codes and Error Handling
All endpoints return appropriate HTTP status codes and detailed error messages for debugging in development mode.

## Examples

### Create Order Flow
1. Customer searches products: `GET /products/search/location`
2. Customer creates order: `POST /orders`
3. Hub owner assigns courier: `PUT /orders/{id}/assign-courier`
4. Courier updates status: `PUT /orders/{id}/status`
5. Real-time updates via WebSocket

### Hub Management Flow
1. Hub owner creates hub: `POST /hubs`
2. Add inventory: `POST /hubs/inventory`
3. Monitor orders: `GET /hubs/{id}/orders`
4. Get analytics: `GET /admin/analytics`

### AI Integration Flow
1. Get product recommendations: `GET /ai/products/recommend`
2. Optimize courier assignment: `POST /ai/courier/assign`
3. Optimize delivery route: `POST /ai/route/optimize`
4. Predict demand: `GET /ai/demand/predict`
