# Backend API Server

Node.js + Express.js backend API serving the SwarmFill Network platform.

## 🏗️ Architecture

### MVC Structure
```
src/
├── controllers/          # Request handlers and business logic
├── models/              # Database models and schemas
├── routes/              # API route definitions
├── middleware/          # Authentication, validation, logging
├── services/            # External service integrations
└── utils/               # Helper functions and utilities
```

## 📊 Database Models

### Core Entities
- **Users**: Customers, Hub Owners, Couriers, Admins
- **Hubs**: Storage locations and capacity management
- **Products**: Catalog and specifications
- **Inventory**: Real-time stock levels
- **Orders**: Order lifecycle and tracking
- **Deliveries**: Courier assignments and tracking
- **Payments**: Transaction processing and history

### Relationships
```sql
Users (1:N) -> Hubs
Hubs (1:N) -> Inventory
Users (1:N) -> Orders
Orders (1:N) -> OrderItems
Orders (1:1) -> Deliveries
Users (1:N) -> Payments
```

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/register       # User registration
POST /api/auth/login          # User login
POST /api/auth/logout         # User logout
POST /api/auth/refresh        # Refresh JWT token
POST /api/auth/verify         # Phone/email verification
```

### User Management
```
GET    /api/users/profile     # Get user profile
PUT    /api/users/profile     # Update user profile
GET    /api/users/hubs        # Get user's hubs
POST   /api/users/rating      # Rate user interaction
```

### Hub Operations
```
GET    /api/hubs/nearby       # Find nearby hubs
POST   /api/hubs/create       # Register new hub
PUT    /api/hubs/:id          # Update hub details
GET    /api/hubs/:id/inventory # Get hub inventory
POST   /api/hubs/:id/access   # Grant customer access
```

### Order Management
```
POST   /api/orders/create     # Place new order
GET    /api/orders/:id        # Get order details
PUT    /api/orders/:id/status # Update order status
GET    /api/orders/history    # Order history
POST   /api/orders/:id/cancel # Cancel order
```

### Delivery System
```
GET    /api/deliveries/available # Available delivery jobs
POST   /api/deliveries/accept    # Accept delivery job
PUT    /api/deliveries/:id/status # Update delivery status
POST   /api/deliveries/:id/complete # Complete delivery
```

### SmartLoad AI Integration
```
POST   /api/smartload/warehouse   # Warehouse optimization
POST   /api/smartload/loading     # Truck loading optimization  
POST   /api/smartload/routing     # Route optimization
GET    /api/smartload/analytics   # Performance metrics
```

### Payment Processing
```
POST   /api/payments/intent      # Create payment intent
POST   /api/payments/confirm     # Confirm payment
GET    /api/payments/history     # Payment history
POST   /api/payments/payout      # Process hub owner payouts
```

## 🔐 Security & Authentication

### JWT Authentication
- Access tokens (15 minutes expiry)
- Refresh tokens (7 days expiry)
- Role-based access control (RBAC)

### API Security
- Rate limiting (100 requests/15 minutes)
- CORS configuration
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Data Protection
- Password hashing with bcrypt
- Sensitive data encryption
- HTTPS enforcement
- Environment variable protection

## 🔄 Real-time Features

### WebSocket Events
```javascript
// Order events
'order:created'
'order:updated' 
'order:cancelled'

// Delivery events
'delivery:assigned'
'delivery:started'
'delivery:completed'

// Hub events
'hub:capacity_alert'
'hub:new_order'

// Crisis events
'crisis:activated'
'crisis:volunteer_needed'
```

## 🧪 Testing

### Unit Tests
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Integration Tests
```bash
npm run test:integration   # API endpoint testing
```

### Test Structure
```
tests/
├── unit/
│   ├── controllers/
│   ├── models/
│   ├── services/
│   └── utils/
└── integration/
    ├── auth.test.js
    ├── orders.test.js
    └── hubs.test.js
```

## 📦 Dependencies

### Core Dependencies
```json
{
  "express": "^4.18.2",
  "pg": "^8.11.1",
  "sequelize": "^6.32.1",
  "jsonwebtoken": "^9.0.1",
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "dotenv": "^16.3.1"
}
```

### External Services
```json
{
  "stripe": "^12.14.0",
  "firebase-admin": "^11.10.1",
  "socket.io": "^4.7.2",
  "redis": "^4.6.7",
  "nodemailer": "^6.9.4",
  "twilio": "^4.14.0"
}
```

## 🚀 Development Setup

### Prerequisites
```bash
Node.js >= 16.0.0
PostgreSQL >= 12
Redis (optional for caching)
```

### Installation
```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables
npm run migrate
npm run seed
npm run dev
```

### Database Setup
```bash
# Create database
createdb swarmfill_db

# Run migrations
npm run migrate

# Seed demo data
npm run seed
```

## 🌐 Environment Configuration

### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/swarmfill_db

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=15m

# External APIs
STRIPE_SECRET_KEY=sk_test_...
GOOGLE_MAPS_API_KEY=your_api_key
FIREBASE_ADMIN_KEY=your_firebase_key

# Services
REDIS_URL=redis://localhost:6379
AI_SERVICE_URL=http://localhost:5000
```

## 📈 Performance & Monitoring

### Optimization Strategies
- Database query optimization
- Redis caching for frequently accessed data
- Connection pooling
- Gzip compression
- API response pagination

### Monitoring
- Request/response logging
- Error tracking with Sentry
- Performance metrics
- Database query performance

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t swarmfill-backend .
docker run -p 3000:3000 swarmfill-backend
```

**Backend ready to power the SwarmFill Network! ⚡**
