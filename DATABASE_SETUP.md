# 🗄️ SwarmFill Database Setup Guide for Windows

## 📋 What You Need
- PostgreSQL database server
- Node.js (already installed)
- PowerShell or Command Prompt

---

## 🚀 Quick Installation (Choose One Option)

### Option A: PostgreSQL Direct Installation (Recommended)

#### Step 1: Download & Install PostgreSQL
1. **Download**: Go to https://www.postgresql.org/download/windows/
2. **Version**: Download PostgreSQL 15.x or 16.x (latest stable)
3. **Run Installer**: Right-click → "Run as Administrator"
4. **Installation Settings**:
   - **Password**: Set a strong password for 'postgres' user (write it down!)
   - **Port**: Keep default `5432`
   - **Locale**: Default (English, United States)
   - **Components**: Install pgAdmin 4 (database management tool)

#### Step 2: Add PostgreSQL to Windows PATH
1. Open **System Properties** → **Environment Variables**
2. Edit **PATH** variable
3. Add: `C:\Program Files\PostgreSQL\16\bin` (adjust version number)
4. **Restart** your PowerShell/Command Prompt

#### Step 3: Verify Installation
```powershell
# Check if PostgreSQL is installed
psql --version
# Should show: psql (PostgreSQL) 16.x

# Check if service is running
Get-Service postgresql*
```

---

### Option B: Docker Setup (Alternative)

If you prefer Docker (no local PostgreSQL needed):

```powershell
# Install Docker Desktop first: https://www.docker.com/products/docker-desktop/

# Navigate to project directory
cd C:\Users\nsrikrishna\sramfill-network\Sparkathon_swarm

# Start PostgreSQL container
docker-compose up -d postgres

# Verify container is running
docker ps
```

---

## 🔧 Database Setup

### Step 1: Create SwarmFill Database
```powershell
# Connect to PostgreSQL as superuser
psql -U postgres
# Enter the password you set during installation

# Create database and user
CREATE DATABASE swarmfill_db;
CREATE USER swarmfill_user WITH PASSWORD 'swarmfill_password_2024';
GRANT ALL PRIVILEGES ON DATABASE swarmfill_db TO swarmfill_user;
ALTER USER swarmfill_user CREATEDB;

# Exit PostgreSQL
\q
```

### Step 2: Test Database Connection
```powershell
# Test if you can connect with the new user
psql -U swarmfill_user -d swarmfill_db
# Enter: swarmfill_password_2024

# If successful, you'll see:
# swarmfill_db=>

# Exit
\q
```

---

## ⚙️ Backend Environment Configuration

### Step 1: Setup Environment File
```powershell
# Navigate to backend directory
```

### Step 2: Add Database Configuration to .env
Add these lines to your backend/.env file:
```env
# Database Configuration
NODE_ENV=development
PORT=3000

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=swarmfill_db
DB_USER=swarmfill_user
DB_PASSWORD=swarmfill_password_2024

# JWT Configuration
JWT_SECRET=swarmfill-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Email Configuration (for later)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URLs (for CORS)
FRONTEND_URLS=http://localhost:3000,http://localhost:19006
```

### Step 3: Install Backend Dependencies
```powershell
# Make sure you're in the backend directory
cd C:\Users\nsrikrishna\sramfill-network\Sparkathon_swarm\backend

# Install all required packages
npm install

# Install additional required packages
npm install express-validator nodemailer crypto
```

### Step 4: Initialize Database
```powershell
# Run database initialization
npm run db:setup

# If the above doesn't work, run directly:
node -e "require('./src/models').syncDatabase()"
```

---

## 🧪 Testing Your Setup

### Step 1: Start the Backend Server
```powershell
# Navigate to backend directory
cd C:\Users\nsrikrishna\sramfill-network\Sparkathon_swarm\backend

# Start the development server
npm run dev

# You should see:
# 🚀 SwarmFill Backend Server running on port 3000
# ✅ Database connected successfully
# 📊 Database models synchronized
```

### Step 2: Test API Endpoints
Open a new PowerShell window and test:

```powershell
# Test health endpoint
curl http://localhost:3000/health

# Should return:
# {"status":"OK","timestamp":"...","uptime":...}

# Test user registration
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "full_name": "Test User",
    "user_type": "customer"
  }'
```

---

## 🐛 Troubleshooting Common Issues

### Issue 1: "psql command not found"
**Solution:**
```powershell
# Add PostgreSQL to PATH
$env:PATH += ";C:\Program Files\PostgreSQL\16\bin"
# Or restart PowerShell after PATH update
```

### Issue 2: "Connection refused" or "Server not running"
**Solution:**
```powershell
# Check if PostgreSQL service is running
Get-Service postgresql*

# Start the service if it's stopped
Start-Service postgresql-x64-16
```

### Issue 3: "Authentication failed for user"
**Solution:**
```powershell
# Reset user password
psql -U postgres
ALTER USER swarmfill_user WITH PASSWORD 'swarmfill_password_2024';
\q
```

### Issue 4: "Database does not exist"
**Solution:**
```powershell
# Recreate the database
psql -U postgres
DROP DATABASE IF EXISTS swarmfill_db;
CREATE DATABASE swarmfill_db;
GRANT ALL PRIVILEGES ON DATABASE swarmfill_db TO swarmfill_user;
\q
```

### Issue 5: "Port 5432 is already in use"
**Solution:**
```powershell
# Find what's using the port
netstat -ano | findstr :5432

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change the port in PostgreSQL configuration
```

---

## 🔍 Useful Database Tools

### pgAdmin 4 (Installed with PostgreSQL)
- **Access**: Start Menu → PostgreSQL → pgAdmin 4
- **URL**: http://localhost:5050 (if web version)
- **Use**: Visual database management, query execution

### VS Code Extensions
1. **PostgreSQL** by Chris Kolkman
2. **SQLTools** by Matheus Teixeira
3. **Database Client** by Weijan Chen

### Command Line Tools
```powershell
# Connect to database
psql -U swarmfill_user -d swarmfill_db

# List all databases
\l

# List all tables
\dt

# Describe a table
\d users

# Execute SQL file
\i path/to/file.sql

# Exit
\q
```

---

## 🎯 Quick Setup Summary

**For first-time setup:**
```powershell
# 1. Install PostgreSQL from postgresql.org
# 2. Create database
psql -U postgres
CREATE DATABASE swarmfill_db;
CREATE USER swarmfill_user WITH PASSWORD 'swarmfill_password_2024';
GRANT ALL PRIVILEGES ON DATABASE swarmfill_db TO swarmfill_user;
\q

# 3. Setup backend
cd backend
npm install
npm install express-validator nodemailer crypto

# 4. Create .env file with database credentials
# 5. Start backend
npm run dev

# 6. Test
curl http://localhost:3000/health
```

**Your SwarmFill backend is now ready! 🚀**
DATABASE_NAME=swarmfill_db
DATABASE_USER=swarmfill_user
DATABASE_PASSWORD=your_password_here
```

### Step 4: Run Database Migrations
```bash
cd backend
npm run db:setup
npm run db:migrate
npm run db:seed
```

## 🔧 Alternative: Docker Setup (Easier)
If you have Docker installed:

```bash
# Run this from the project root
docker-compose up -d postgres

# This will:
# - Start PostgreSQL in a container
# - Create the database automatically
# - Use the credentials from .env
```

## 🧪 Test Database Connection
```bash
cd backend
npm run test:db
```

## 📊 Access Database
- **pgAdmin**: http://localhost:80 (if installed)
- **Command Line**: `psql -U swarmfill_user -d swarmfill_db -h localhost`

## 🚨 Troubleshooting
- **Connection refused**: Make sure PostgreSQL service is running
- **Password authentication failed**: Check your .env credentials
- **Database doesn't exist**: Run the CREATE DATABASE command again
- **Permission denied**: Make sure user has proper privileges

## 📝 Next Steps
After database is set up:
1. Run `npm install` in the backend directory
2. Run `npm run dev` to start the backend server
3. Check http://localhost:3000/health to verify everything works
