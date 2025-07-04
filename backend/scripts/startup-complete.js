#!/usr/bin/env node

/**
 * 🚀 SwarmFill Backend Complete Startup Script
 * 
 * This script will:
 * 1. Set up the database
 * 2. Run all migrations
 * 3. Seed the database with test data
 * 4. Start the server
 * 5. Provide authentication tokens for testing
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(`🚀 ${title}`, colors.bright + colors.cyan);
  log(`${'='.repeat(60)}`, colors.cyan);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

async function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    logInfo(`Running: ${description}`);
    
    const child = exec(command, { cwd: __dirname + '/..' });
    
    child.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    child.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        logSuccess(`${description} completed successfully`);
        resolve();
      } else {
        logError(`${description} failed with code ${code}`);
        reject(new Error(`Command failed: ${command}`));
      }
    });
  });
}

async function checkEnvFile() {
  logSection('CHECKING ENVIRONMENT');
  
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      logWarning('.env file not found. Copying from .env.example');
      fs.copyFileSync(envExamplePath, envPath);
      logSuccess('.env file created');
      logWarning('Please update .env with your database credentials before continuing');
      process.exit(1);
    } else {
      logError('Neither .env nor .env.example found!');
      process.exit(1);
    }
  } else {
    logSuccess('.env file exists');
  }
}

async function setupDatabase() {
  logSection('DATABASE SETUP');
  
  try {
    // Test database connection
    await runCommand('node scripts/test-connection.js', 'Testing database connection');
    
    // Instead of manual migrations, use Sequelize sync
    logInfo('Syncing database models (automatic table creation)...');
    
    const { syncDatabase } = require('../src/models');
    await syncDatabase();
    logSuccess('Database models synchronized successfully');
    
    // Seed database
    await runCommand('node scripts/seed-database.js', 'Seeding database with test data');
    
  } catch (error) {
    logError(`Database setup failed: ${error.message}`);
    process.exit(1);
  }
}

async function waitForServer(url, maxAttempts = 30) {
  logInfo('Waiting for server to be ready...');
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get(url);
      logSuccess('Server is ready!');
      return true;
    } catch (error) {
      if (i < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  logError('Server failed to start within timeout');
  return false;
}

async function getTestTokens() {
  logSection('GENERATING TEST TOKENS');
  
  const baseUrl = 'http://localhost:3001/api';
  const tokens = {};
  
  // Test accounts from seed data
  const testAccounts = [
    { role: 'admin', email: 'admin@swarmfill.com', password: 'password123' },
    { role: 'hub_owner', email: 'hubowner1@swarmfill.com', password: 'password123' },
    { role: 'courier', email: 'courier1@swarmfill.com', password: 'password123' },
    { role: 'customer', email: 'customer1@swarmfill.com', password: 'password123' }
  ];
  
  for (const account of testAccounts) {
    try {
      logInfo(`Getting token for ${account.role}: ${account.email}`);
      
      const response = await axios.post(`${baseUrl}/auth/login`, {
        email: account.email,
        password: account.password
      });
      
      if (response.data.success && response.data.data.token) {
        tokens[account.role] = {
          token: response.data.data.token,
          user: response.data.data.user
        };
        logSuccess(`✅ ${account.role.toUpperCase()} token obtained`);
      } else {
        logWarning(`Failed to get token for ${account.role}`);
      }
    } catch (error) {
      logWarning(`Failed to login ${account.role}: ${error.response?.data?.message || error.message}`);
    }
  }
  
  return tokens;
}

function displayTestingInfo(tokens) {
  logSection('🧪 API TESTING INFORMATION');
  
  log('\n📋 BEARER TOKENS FOR TESTING:', colors.bright + colors.yellow);
  
  Object.keys(tokens).forEach(role => {
    const token = tokens[role];
    log(`\n${role.toUpperCase()} TOKEN:`, colors.bright + colors.green);
    log(`Email: ${token.user.email}`, colors.cyan);
    log(`Token: ${token.token.substring(0, 50)}...`, colors.white);
    log(`Full Token: ${token.token}`, colors.white);
  });
  
  log('\n🔧 EXAMPLE API CALLS:', colors.bright + colors.yellow);
  
  log('\n# Health Check (Public)', colors.green);
  log('curl -X GET http://localhost:3001/health', colors.white);
  
  if (tokens.customer) {
    log('\n# Get User Profile (Customer)', colors.green);
    log(`curl -X GET http://localhost:3001/api/auth/profile \\`, colors.white);
    log(`  -H "Authorization: Bearer ${tokens.customer.token}"`, colors.white);
  }
  
  if (tokens.admin) {
    log('\n# Get All Users (Admin)', colors.green);
    log(`curl -X GET http://localhost:3001/api/users \\`, colors.white);
    log(`  -H "Authorization: Bearer ${tokens.admin.token}"`, colors.white);
  }
  
  if (tokens.hub_owner) {
    log('\n# Create Hub (Hub Owner)', colors.green);
    log(`curl -X POST http://localhost:3001/api/hubs \\`, colors.white);
    log(`  -H "Authorization: Bearer ${tokens.hub_owner.token}" \\`, colors.white);
    log(`  -H "Content-Type: application/json" \\`, colors.white);
    log(`  -d '{"name":"Test Hub","address":"123 Test St","latitude":40.7128,"longitude":-74.0060,"capacity_m3":100}'`, colors.white);
  }
  
  log('\n📚 COMPLETE TESTING GUIDE:', colors.bright + colors.yellow);
  log('See: COMPLETE_API_TESTING_GUIDE.md', colors.cyan);
  
  log('\n🌐 SERVER ENDPOINTS:', colors.bright + colors.yellow);
  log('Health Check: http://localhost:3001/health', colors.cyan);
  log('API Base URL: http://localhost:3001/api', colors.cyan);
  log('WebSocket: ws://localhost:3001', colors.cyan);
  
  log('\n🔍 AVAILABLE API ROUTES:', colors.bright + colors.yellow);
  const routes = [
    'Authentication: /api/auth/*',
    'Users: /api/users/*',
    'Hubs: /api/hubs/*',
    'Products: /api/products/*',
    'Orders: /api/orders/*',
    'Routes: /api/routes/*',
    'AI: /api/ai/*',
    'Admin: /api/admin/*',
    'Pickup: /api/pickup/*',
    'Community: /api/community/*',
    'Crisis: /api/crisis/*',
    'Mobile: /api/mobile/*',
    'Notifications: /api/notifications/*',
    'Realtime: /api/realtime/*'
  ];
  
  routes.forEach(route => {
    log(`  ${route}`, colors.cyan);
  });
}

async function startServer() {
  logSection('STARTING SERVER');
  
  return new Promise((resolve, reject) => {
    logInfo('Starting SwarmFill Backend Server...');
    
    const server = spawn('node', ['src/server.js'], {
      cwd: path.join(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    server.stdout.on('data', (data) => {
      process.stdout.write(data);
      
      // Check if server started successfully
      if (data.toString().includes('SwarmFill Backend Server running')) {
        setTimeout(resolve, 2000); // Give it a moment to fully initialize
      }
    });
    
    server.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
    
    server.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Server process exited with code ${code}`));
      }
    });
    
    // Keep the server running
    process.on('SIGINT', () => {
      logInfo('Shutting down server...');
      server.kill('SIGTERM');
      process.exit(0);
    });
  });
}

async function main() {
  try {
    log(`${colors.bright}${colors.blue}
╔════════════════════════════════════════════════════════════╗
║                 🚀 SWARMFILL BACKEND STARTUP               ║
║                Complete Setup & Testing Tool               ║
╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
    
    // Step 1: Check environment
    await checkEnvFile();
    
    // Step 2: Setup database
    await setupDatabase();
    
    // Step 3: Start server
    const serverPromise = startServer();
    await serverPromise;
    
    // Step 4: Wait for server to be ready
    const serverReady = await waitForServer('http://localhost:3001/health');
    
    if (serverReady) {
      // Step 5: Get test tokens
      const tokens = await getTestTokens();
      
      // Step 6: Display testing information
      displayTestingInfo(tokens);
      
      // Step 7: Save tokens to file for easy access
      const tokensPath = path.join(__dirname, '..', 'test-tokens.json');
      fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
      logSuccess(`Test tokens saved to: test-tokens.json`);
      
      logSection('✅ STARTUP COMPLETE');
      logSuccess('SwarmFill Backend is ready for testing!');
      logInfo('Press Ctrl+C to stop the server');
      
      // Keep the process running
      process.stdin.resume();
    }
    
  } catch (error) {
    logError(`Startup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the startup script
if (require.main === module) {
  main();
}

module.exports = { main };
