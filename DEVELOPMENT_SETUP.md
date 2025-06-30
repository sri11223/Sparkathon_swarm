# Development Setup Guide

## Prerequisites

Make sure you have the following installed:

- **Node.js** (v18+): [Download here](https://nodejs.org/)
- **Python** (v3.11+): [Download here](https://www.python.org/downloads/)
- **PostgreSQL** (v15+): [Download here](https://www.postgresql.org/download/)
- **Redis** (optional, for caching): [Download here](https://redis.io/download)
- **Docker & Docker Compose** (optional, for containerized setup): [Download here](https://www.docker.com/products/docker-desktop)
- **Expo CLI** (for mobile development): `npm install -g @expo/cli`

## Quick Start

### Option 1: Local Development Setup

1. **Install Dependencies**
```bash
# Root dependencies
npm install

# Backend dependencies  
cd backend && npm install

# Frontend dependencies
cd frontend/customer-mobile-app && npm install
cd ../hubowner-mobile-app && npm install
cd ../courier-mobile-app && npm install
cd ../admin-web-dashboard && npm install
cd ../shared-components && npm install

# AI Services dependencies (requires Python)
cd ../../ai-services && pip install -r requirements.txt
```

2. **Setup Environment Variables**
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
# - Database credentials
# - API keys
# - External service URLs
```

3. **Setup Database**
```bash
# Create PostgreSQL database
createdb swarmfill_db

# Run migrations (when implemented)
cd backend && npm run migrate
```

4. **Start Services**

Open multiple terminal windows:

```bash
# Terminal 1: Backend API
cd backend && npm run dev

# Terminal 2: AI Services  
cd ai-services && python main.py

# Terminal 3: Customer Mobile App
cd frontend/customer-mobile-app && npm start

# Terminal 4: Hub Owner Mobile App
cd frontend/hubowner-mobile-app && npm start

# Terminal 5: Courier Mobile App
cd frontend/courier-mobile-app && npm start

# Terminal 6: Admin Web Dashboard
cd frontend/admin-web-dashboard && npm run dev
```

### Option 2: Docker Development Setup

1. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env
# Edit with your preferences
```

2. **Start All Services**
```bash
cd deployment/docker
docker-compose up -d
```

3. **Monitor Logs**
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f ai-services
```

## Alternative: Start Without AI Services

If you're having issues with Python dependencies, you can start developing the frontend and backend first:

### Backend-Only Development
```bash
# Start just the backend API (already working)
cd backend && npm run dev
```

### Frontend Development
```bash
# Start the mobile apps
cd frontend/customer-mobile-app && npm start
cd frontend/hubowner-mobile-app && npm start
cd frontend/courier-mobile-app && npm start

# Start the web dashboard
cd frontend/admin-web-dashboard && npm run dev
```

### Mock AI Services
The backend already includes mock AI endpoints that return simulated data:
- `GET /api/ai/warehouse/optimize` - Returns mock warehouse optimization
- `GET /api/ai/truck/optimize` - Returns mock truck loading data
- `GET /api/ai/demand/predict` - Returns mock demand predictions

This allows you to develop and demonstrate the full application flow without requiring the Python AI services to be running.

## Development URLs

After starting the services, you can access:

- **Backend API**: http://localhost:3000
  - Health Check: http://localhost:3000/health
  - API Docs: http://localhost:3000/api (when implemented)

- **AI Services**: http://localhost:5000
  - Health Check: http://localhost:5000/health

- **Admin Web Dashboard**: http://localhost:3001

- **Mobile Apps**: 
  - Customer App: Expo Metro bundler will provide QR code
  - Hub Owner App: Expo Metro bundler will provide QR code  
  - Courier App: Expo Metro bundler will provide QR code

## Mobile Development

1. **Install Expo Go App** on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Run Mobile Apps**:
   ```bash
   cd frontend/customer-mobile-app
   npm start
   ```
   - Scan QR code with Expo Go app
   - Or press 'w' to open in web browser

## Database Management

### Using psql (PostgreSQL CLI)
```bash
# Connect to database
psql -U postgres -d swarmfill_db

# Common commands
\dt                 # List tables
\d table_name       # Describe table
\q                  # Quit
```

### Using Docker
```bash
# Connect to PostgreSQL container
docker-compose exec postgres psql -U postgres -d swarmfill_db
```

## Testing

```bash
# Backend tests
cd backend && npm test

# AI Services tests  
cd ai-services && python -m pytest

# Frontend tests
cd frontend/admin-web-dashboard && npm test
```

## Common Issues & Solutions

### Port Already in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000
# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Python/pip Not Found or Network Issues
```bash
# Windows: If Python is installed but pip has network issues
# Option 1: Use py launcher instead of python
py --version
py -m pip install flask

# Option 2: Install with alternative index
py -m pip install --index-url https://pypi.org/simple/ flask

# Option 3: Download packages manually and install offline
# Visit https://pypi.org/project/flask/ and download .whl files

# Option 4: For development, start with basic Flask
# Create a virtual environment first
py -m venv ai-env
ai-env\Scripts\activate
py -m pip install flask flask-cors python-dotenv

# If network issues persist, focus on backend/frontend first
# AI services can be mocked for demonstration purposes
```

### Node.js Version Issues
```bash
# Use Node Version Manager
# Windows: Install nvm-windows
# macOS/Linux: Install nvm

nvm install 20
nvm use 20
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_ctl status

# Start PostgreSQL service
# Windows: net start postgresql-x64-15
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

## VS Code Setup

Recommended VS Code extensions:
- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**
- **Python**
- **Docker**
- **Thunder Client** (for API testing)

## API Testing

Use Thunder Client (VS Code extension) or Postman:

### Sample API Calls

**Backend Health Check:**
```
GET http://localhost:3000/health
```

**AI Services - Warehouse Optimization:**
```
POST http://localhost:5000/api/warehouse/optimize
Content-Type: application/json

{
  "warehouse_dimensions": {
    "length": 100,
    "width": 50,
    "height": 10
  },
  "inventory_data": [...],
  "access_points": [...]
}
```

## Production Deployment

For production deployment, see:
- `deployment/aws/` for AWS setup
- `deployment/docker/docker-compose.prod.yml` for production Docker setup

## Getting Help

- **Documentation**: Check `docs/` folder
- **API Reference**: Available at `/api/docs` when backend is running
- **Issues**: Create GitHub issues for bugs/feature requests
