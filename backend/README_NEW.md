# 🚀 SwarmFill Network Backend

Complete backend API for the SwarmFill Network - An AI-powered logistics and supply chain management platform.

## ⚡ **QUICK START**

### 🎯 **One-Command Setup (Recommended)**

```bash
# Install dependencies
npm install

# Complete setup: migrations, seed data, start server, get test tokens
npm run startup
```

**That's it!** The startup script will automatically:
- ✅ Check environment setup
- ✅ Run database migrations
- ✅ Seed database with test data
- ✅ Start the server
- ✅ Generate Bearer tokens for all user roles
- ✅ Provide API testing examples

---

## 📋 **Manual Setup (Alternative)**

### **Prerequisites**
- Node.js 18+
- PostgreSQL 12+
- Redis (for real-time features)

### **Installation**
```bash
# 1. Clone and install
git clone <repository-url>
cd backend
npm install

# 2. Environment setup
cp .env.example .env
# Edit .env with your database credentials

# 3. Database setup
npm run db:migrate
npm run db:seed

# 4. Start server
npm start
```

---

## 🔐 **Authentication & Testing**

### **Pre-seeded Test Accounts**

```bash
# ADMIN
Email: admin@swarmfill.com
Password: password123

# HUB OWNER  
Email: hubowner1@swarmfill.com
Password: password123

# COURIER
Email: courier1@swarmfill.com
Password: password123

# CUSTOMER
Email: customer1@swarmfill.com
Password: password123
```

### **Get Bearer Tokens**

```bash
# Login to get authentication token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@swarmfill.com", "password": "password123"}'

# Use token in protected requests
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🌐 **API Overview**

### **Base URL:** `http://localhost:3001/api`

### **Available Endpoints (125+ total):**

| Category | Endpoints | Description |
|----------|-----------|-------------|
| 🔐 **Authentication** | 8 | Login, register, profile management |
| 👥 **Users** | 15 | User management, profiles, preferences |
| 🏢 **Hubs** | 15 | Hub operations, inventory, capacity |
| 📦 **Products** | 12 | Product catalog, categories, tracking |
| 🛒 **Orders** | 20 | Order lifecycle, tracking, fulfillment |
| 🚚 **Routes** | 12 | Route optimization, delivery planning |
| 🤖 **AI Services** | 10 | Smart optimization, analytics, insights |
| ⚙️ **Admin** | 8 | System administration, monitoring |
| 📱 **Pickup** | 6 | Pickup scheduling, management |
| 🏘️ **Community** | 9 | Community hubs, challenges, leaderboards |
| 🚨 **Crisis** | 10 | Emergency response, volunteer coordination |
| 📱 **Mobile** | 8 | Mobile-specific features, push notifications |
| 🔔 **Notifications** | 7 | Notification management, preferences |
| 🔄 **Real-time** | 5 | WebSocket connections, live updates |

---

## 🏗️ **Architecture**

### **Tech Stack**
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL with Sequelize ORM
- **Real-time:** Socket.IO with Redis adapter
- **Authentication:** JWT tokens
- **Security:** Helmet, CORS, rate limiting
- **Validation:** Joi & express-validator
- **Logging:** Winston

### **Project Structure**
```
backend/
├── src/
│   ├── controllers/     # API endpoint handlers
│   ├── models/         # Database models (Sequelize)
│   ├── routes/         # Express route definitions
│   ├── middleware/     # Authentication, validation, error handling
│   ├── services/       # Business logic, external integrations
│   ├── utils/          # Helper functions, utilities
│   └── config/         # Database, environment configuration
├── migrations/         # Database migration files
├── scripts/           # Setup, seed, utility scripts
├── tests/             # Test suites
└── docs/              # API documentation
```

---

## 📊 **Key Features**

### **🔥 Core Functionality**
- ✅ Multi-role authentication (Admin, Hub Owner, Courier, Customer)
- ✅ Complete order lifecycle management
- ✅ Real-time tracking and notifications
- ✅ AI-powered route optimization
- ✅ Inventory management with capacity tracking
- ✅ Hub network optimization

### **🌟 Advanced Features**
- ✅ **Community Commerce:** Community hubs, challenges, leaderboards
- ✅ **Crisis Management:** Emergency response, volunteer coordination
- ✅ **Mobile Integration:** Push notifications, device-specific endpoints
- ✅ **Real-time Communication:** WebSocket connections, live updates
- ✅ **Smart AI:** Load optimization, predictive analytics
- ✅ **Earnings System:** Community earnings, financial tracking

---

## 🧪 **Testing**

### **Quick Health Check**
```bash
curl http://localhost:3001/health
```

### **Comprehensive Testing**
See `COMPLETE_API_TESTING_GUIDE.md` for detailed testing instructions including:
- 📋 Authentication flows for all roles
- 🔧 Complete curl examples for all endpoints  
- ✅ Expected responses and error handling
- 🚀 Postman collection setup
- 📝 Full verification checklist

### **Available Test Commands**
```bash
npm test              # Run test suite
npm run test:watch    # Watch mode testing
npm run lint          # Code linting
npm run lint:fix      # Auto-fix linting issues
```

---

## 🚀 **Deployment**

### **Development**
```bash
npm run dev           # Start with auto-reload
npm run startup       # Complete setup + start
```

### **Production**
```bash
npm start             # Production server
npm run db:migrate    # Run migrations only
npm run db:seed       # Seed data only
```

### **Environment Variables**
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
```

---

## 📈 **Monitoring & Health**

### **Health Endpoint:** `/health`
Returns server status, uptime, database connectivity, and Socket.IO statistics.

### **Logging**
- Structured logging with Winston
- Request/response logging
- Error tracking and monitoring
- Performance metrics

---

## 🤝 **API Documentation**

### **Complete Documentation**
- `API_ENDPOINTS_MAIN_BRANCH.md` - Full endpoint specification
- `COMPLETE_API_TESTING_GUIDE.md` - Testing instructions
- `FINAL_CODE_REVIEW.md` - Implementation summary

### **Postman Collection**
Import the provided Postman collection for easy API testing with pre-configured:
- Environment variables
- Authentication flows
- Request examples
- Response validation

---

## 🆘 **Troubleshooting**

### **Common Issues**

**Database Connection Failed:**
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
npm run db:test
```

**Authentication Errors:**
```bash
# Verify token format
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACTUAL_TOKEN"
```

**Port Already in Use:**
```bash
# Change port in .env
PORT=3002
```

### **Reset Database**
```bash
npm run db:reset      # Drop and recreate database
npm run db:migrate    # Run migrations
npm run db:seed       # Seed test data
```

---

## 👨‍💻 **Development**

### **Code Standards**
- ESLint configuration for code quality
- Consistent error handling patterns
- Structured logging throughout
- Comprehensive input validation
- Security best practices

### **Contributing**
1. Follow existing code patterns
2. Add tests for new features  
3. Update documentation
4. Ensure all linting passes
5. Test all authentication flows

---

## 📞 **Support**

For questions, issues, or feature requests:
- 📧 Check the testing guide first
- 🐛 Review error logs in `logs/` directory
- 💬 Verify all environment variables are set
- 🔍 Use health endpoint to check system status

---

**🎉 Your SwarmFill Network backend is ready for production!**

Run `npm run startup` to get started immediately with full setup and testing tokens.
