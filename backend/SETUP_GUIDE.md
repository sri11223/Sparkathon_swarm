# 🚀 SwarmFill Backend Complete Setup Guide

This guide will walk you through setting up the complete SwarmFill backend from scratch.

## 📋 Prerequisites

### Required Software
1. **Node.js** (v18 or higher): https://nodejs.org/
2. **PostgreSQL** (v13 or higher): https://www.postgresql.org/download/
3. **Git**: https://git-scm.com/

### Optional (but recommended)
- **Docker Desktop**: https://www.docker.com/products/docker-desktop/ (for easier database setup)
- **pgAdmin**: Database management tool (usually comes with PostgreSQL)
- **Postman**: For API testing

---

## 🛠️ Setup Methods

### Method 1: Docker Setup (Recommended - Easiest)

If you have Docker installed:

```bash
# 1. Navigate to project root
cd Sparkathon_swarm

# 2. Start database with Docker
docker-compose up -d postgres

# 3. Wait for database to start (about 30 seconds)
docker-compose logs postgres

# 4. Navigate to backend
cd backend

# 5. Install dependencies
npm install

# 6. Setup database tables
npm run db:setup

# 7. Add sample data
npm run db:seed

# 8. Start the server
npm run dev
```

### Method 2: Manual PostgreSQL Setup

If you prefer to install PostgreSQL manually:

#### Step 1: Install PostgreSQL
1. Download from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for 'postgres' user
4. Ensure PostgreSQL service is running

#### Step 2: Create Database
Open Command Prompt or PowerShell as Administrator:

```bash
# Connect to PostgreSQL
psql -U postgres -h localhost

# Enter the password you set during installation
# Then run these commands:

CREATE DATABASE swarmfill_db;
CREATE USER swarmfill_user WITH PASSWORD 'swarmfill123';
GRANT ALL PRIVILEGES ON DATABASE swarmfill_db TO swarmfill_user;
\c swarmfill_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\q
```

#### Step 3: Setup Backend
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Test database connection
npm run db:test

# Setup database tables
npm run db:setup

# Add sample data
npm run db:seed

# Start the server
npm run dev
```

---

## ✅ Verification Steps

### 1. Check Database Connection
```bash
npm run db:test
```

Expected output:
```
✅ Database connection successful
✅ Query execution successful
📊 PostgreSQL version: PostgreSQL 15.x...
✅ All models loaded successfully
📋 Database tables:
   - users
   - hubs
   - products
   - inventory
   - orders
   - order_items
🎉 Database is ready for use!
```

### 2. Check Server Health
Open browser and go to: http://localhost:3000/health

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-06-30T...",
  "uptime": 123.456,
  "environment": "development",
  "socketConnections": {
    "total": 0,
    "customers": 0,
    "hubowners": 0,
    "couriers": 0
  }
}
```

### 3. Test API Endpoints
You can test these endpoints in Postman or your browser:

- **GET** http://localhost:3000/health - Server health check
- **POST** http://localhost:3000/api/auth/register - User registration
- **POST** http://localhost:3000/api/auth/login - User login
- **GET** http://localhost:3000/api/hubs - List all hubs
- **GET** http://localhost:3000/api/products - List all products

---

## 🧪 Sample Data Overview

After running `npm run db:seed`, you'll have:

### Users
- **Admin**: admin@swarmfill.com (password: Admin123!@#)
- **Hub Owner 1**: owner1@example.com (password: HubOwner123!)
- **Hub Owner 2**: owner2@example.com (password: HubOwner123!)
- **Courier 1**: courier1@example.com (password: Courier123!)
- **Courier 2**: courier2@example.com (password: Courier123!)
- **Customer 1**: customer1@example.com (password: Customer123!)
- **Customer 2**: customer2@example.com (password: Customer123!)

### Hubs
- **Downtown Grocery Hub** (owned by Hub Owner 1)
- **SoHo Electronics Store** (owned by Hub Owner 2)
- **Central Warehouse** (owned by Hub Owner 1)

### Products
- Organic Bananas, Whole Milk, Bread (grocery items)
- iPhone 15 Pro, Samsung 65" TV, Wireless Headphones (electronics)

### Inventory
- Each hub has different products at different prices
- Stock levels and low-stock thresholds are set

---

## 🔧 Development Commands

```bash
# Start server in development mode (auto-restart on changes)
npm run dev

# Start server in production mode
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Check code quality
npm run lint

# Fix code formatting
npm run lint:fix

# Database commands
npm run db:test      # Test database connection
npm run db:setup     # Create/sync database tables
npm run db:seed      # Add sample data
npm run db:reset     # WARNING: Deletes all data and recreates tables
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/     # Business logic
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── hubController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   ├── inventoryController.js
│   │   ├── adminController.js
│   │   └── aiController.js
│   ├── middleware/      # Authentication, validation, etc.
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── models/          # Database models
│   │   ├── index.js     # Model relationships
│   │   ├── User.js
│   │   ├── Hub.js
│   │   ├── Product.js
│   │   ├── Inventory.js
│   │   ├── Order.js
│   │   └── OrderItem.js
│   ├── routes/          # API endpoints
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── hubs.js
│   │   ├── orders.js
│   │   ├── products.js
│   │   ├── admin.js
│   │   └── ai.js
│   ├── services/        # External integrations
│   │   ├── emailService.js
│   │   ├── socketManager.js
│   │   └── aiService.js
│   ├── utils/           # Helper functions
│   │   └── logger.js
│   ├── config/          # Configuration files
│   │   └── database.js
│   └── server.js        # Main server file
├── scripts/             # Database management scripts
├── logs/               # Application logs
├── .env                # Environment variables
└── package.json        # Dependencies and scripts
```

---

## 🚨 Troubleshooting

### Database Issues

**Error: "connection refused"**
- Check if PostgreSQL service is running
- Windows: Services → PostgreSQL
- Or restart: `net stop postgresql-x64-15` then `net start postgresql-x64-15`

**Error: "password authentication failed"**
- Check your .env file database credentials
- Ensure user exists and has proper permissions

**Error: "database does not exist"**
- Run the CREATE DATABASE command again
- Or use Docker method for automatic setup

### Server Issues

**Error: "Port 3000 already in use"**
- Change PORT in .env file
- Or kill the process using port 3000

**Error: "Cannot find module"**
- Run `npm install` to install dependencies
- Check if all files are in the correct locations

### Permission Issues

**Error: "permission denied"**
- Make sure you're running as Administrator (Windows)
- Check file permissions in the project directory

---

## 🔒 Security Notes

### Development vs Production

This setup is configured for **development only**. For production:

1. **Change all default passwords**
2. **Use strong JWT secrets**
3. **Enable SSL/HTTPS**
4. **Use environment-specific .env files**
5. **Set up proper firewall rules**
6. **Use a managed database service**

### Default Credentials (Development Only)
- Database: swarmfill_user / swarmfill123
- JWT Secret: swarmfill-super-secret-jwt-key-development-only

**⚠️ NEVER use these in production!**

---

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs**: `backend/logs/swarmfill.log`
2. **Test database**: `npm run db:test`
3. **Verify environment**: Check your .env file
4. **Reset and retry**: `npm run db:reset` then `npm run db:seed`

---

## 🎉 Next Steps

Once the backend is running:

1. **Test API endpoints** with Postman
2. **Review the API documentation** (if generated)
3. **Start frontend development** 
4. **Integrate with AI services**
5. **Add real-time features** with WebSockets

Your SwarmFill backend is now ready for development! 🚀
