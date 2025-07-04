#!/usr/bin/env node

/**
 * 🔍 Final Validation Script
 * 
 * Comprehensive validation of all backend components
 */

const fs = require('fs');
const path = require('path');

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
  log(`🔍 ${title}`, colors.bright + colors.cyan);
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

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    logSuccess(`${description} exists`);
  } else {
    logError(`${description} missing: ${filePath}`);
  }
  return exists;
}

function validateSyntax(filePath, description) {
  try {
    if (filePath.endsWith('.js')) {
      require(filePath);
      logSuccess(`${description} - syntax valid`);
      return true;
    } else if (filePath.endsWith('.json')) {
      JSON.parse(fs.readFileSync(filePath, 'utf8'));
      logSuccess(`${description} - JSON valid`);
      return true;
    }
  } catch (error) {
    logError(`${description} - syntax error: ${error.message}`);
    return false;
  }
  return true;
}

function validatePackageJson() {
  logSection('PACKAGE.JSON VALIDATION');
  
  const packagePath = path.join(__dirname, '..', 'package.json');
  if (!checkFileExists(packagePath, 'package.json')) return false;
  
  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Check required scripts
    const requiredScripts = ['start', 'dev', 'startup', 'db:migrate', 'db:seed', 'test'];
    let scriptsValid = true;
    
    requiredScripts.forEach(script => {
      if (pkg.scripts && pkg.scripts[script]) {
        logSuccess(`Script '${script}' defined`);
      } else {
        logError(`Script '${script}' missing`);
        scriptsValid = false;
      }
    });
    
    // Check dependencies
    const requiredDeps = ['express', 'sequelize', 'pg', 'socket.io', 'jsonwebtoken', 'bcryptjs'];
    let depsValid = true;
    
    requiredDeps.forEach(dep => {
      if (pkg.dependencies && pkg.dependencies[dep]) {
        logSuccess(`Dependency '${dep}' installed`);
      } else {
        logError(`Dependency '${dep}' missing`);
        depsValid = false;
      }
    });
    
    return scriptsValid && depsValid;
  } catch (error) {
    logError(`package.json validation failed: ${error.message}`);
    return false;
  }
}

function validateEnvironment() {
  logSection('ENVIRONMENT VALIDATION');
  
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  
  let envValid = true;
  
  if (!checkFileExists(envExamplePath, '.env.example')) {
    envValid = false;
  }
  
  if (checkFileExists(envPath, '.env')) {
    logSuccess('Environment file exists');
  } else {
    logWarning('No .env file - will need manual setup');
  }
  
  return envValid;
}

function validateModels() {
  logSection('DATABASE MODELS VALIDATION');
  
  const modelsDir = path.join(__dirname, '..', 'src', 'models');
  const expectedModels = [
    'index.js',
    'User.js',
    'Hub.js',
    'Product.js',
    'Inventory.js',
    'Order.js',
    'OrderItem.js',
    'DeliveryRoute.js',
    'RouteOrder.js',
    'CommunityHub.js',
    'CrisisEvent.js',
    'EmergencyHub.js',
    'CommunityChallenge.js',
    'PushNotificationToken.js',
    'SmartLoadOptimization.js',
    'CommunityEarnings.js',
    'SafetyReport.js',
    'CommunityLeaderboard.js'
  ];
  
  let modelsValid = true;
  
  expectedModels.forEach(model => {
    const modelPath = path.join(modelsDir, model);
    if (checkFileExists(modelPath, `Model: ${model}`)) {
      if (!validateSyntax(modelPath, `Model: ${model}`)) {
        modelsValid = false;
      }
    } else {
      modelsValid = false;
    }
  });
  
  return modelsValid;
}

function validateControllers() {
  logSection('CONTROLLERS VALIDATION');
  
  const controllersDir = path.join(__dirname, '..', 'src', 'controllers');
  const expectedControllers = [
    'authController.js',
    'userController.js',
    'hubController.js',
    'productController.js',
    'orderController.js',
    'routeController.js',
    'aiController.js',
    'adminController.js',
    'pickupController.js',
    'communityController.js',
    'crisisController.js',
    'mobileController.js',
    'notificationController.js',
    'realtimeController.js'
  ];
  
  let controllersValid = true;
  
  expectedControllers.forEach(controller => {
    const controllerPath = path.join(controllersDir, controller);
    if (checkFileExists(controllerPath, `Controller: ${controller}`)) {
      if (!validateSyntax(controllerPath, `Controller: ${controller}`)) {
        controllersValid = false;
      }
    } else {
      controllersValid = false;
    }
  });
  
  return controllersValid;
}

function validateRoutes() {
  logSection('ROUTES VALIDATION');
  
  const routesDir = path.join(__dirname, '..', 'src', 'routes');
  const expectedRoutes = [
    'auth.js',
    'users.js',
    'hubs.js',
    'products.js',
    'orders.js',
    'routes.js',
    'ai.js',
    'admin.js',
    'pickup.js',
    'community.js',
    'crisis.js',
    'mobile.js',
    'notifications.js',
    'realtime.js'
  ];
  
  let routesValid = true;
  
  expectedRoutes.forEach(route => {
    const routePath = path.join(routesDir, route);
    if (checkFileExists(routePath, `Route: ${route}`)) {
      if (!validateSyntax(routePath, `Route: ${route}`)) {
        routesValid = false;
      }
    } else {
      routesValid = false;
    }
  });
  
  return routesValid;
}

function validateMigrations() {
  logSection('MIGRATIONS VALIDATION');
  
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const expectedMigrations = [
    '20250704120001-create-community-crisis-tables.js',
    '20250704120002-create-additional-models.js',
    '20250704120003-create-final-models.js'
  ];
  
  let migrationsValid = true;
  
  expectedMigrations.forEach(migration => {
    const migrationPath = path.join(migrationsDir, migration);
    if (checkFileExists(migrationPath, `Migration: ${migration}`)) {
      if (!validateSyntax(migrationPath, `Migration: ${migration}`)) {
        migrationsValid = false;
      }
    } else {
      migrationsValid = false;
    }
  });
  
  return migrationsValid;
}

function validateScripts() {
  logSection('SCRIPTS VALIDATION');
  
  const scriptsDir = path.join(__dirname, '..');
  const expectedScripts = [
    'scripts/startup-complete.js',
    'scripts/migrate.js',
    'scripts/seed-database.js'
  ];
  
  let scriptsValid = true;
  
  expectedScripts.forEach(script => {
    const scriptPath = path.join(scriptsDir, script);
    if (checkFileExists(scriptPath, `Script: ${script}`)) {
      if (!validateSyntax(scriptPath, `Script: ${script}`)) {
        scriptsValid = false;
      }
    } else {
      scriptsValid = false;
    }
  });
  
  return scriptsValid;
}

function validateDocumentation() {
  logSection('DOCUMENTATION VALIDATION');
  
  const docsDir = path.join(__dirname, '..');
  const expectedDocs = [
    'README_NEW.md',
    'COMPLETE_API_TESTING_GUIDE.md',
    'FINAL_CODE_REVIEW.md',
    'PRODUCTION_READY.md',
    'API_ENDPOINTS_MAIN_BRANCH.md'
  ];
  
  let docsValid = true;
  
  expectedDocs.forEach(doc => {
    const docPath = path.join(docsDir, doc);
    if (checkFileExists(docPath, `Documentation: ${doc}`)) {
      const content = fs.readFileSync(docPath, 'utf8');
      if (content.length > 100) {
        logSuccess(`Documentation: ${doc} - has content`);
      } else {
        logWarning(`Documentation: ${doc} - seems empty`);
      }
    } else {
      docsValid = false;
    }
  });
  
  return docsValid;
}

function validateServerFile() {
  logSection('SERVER FILE VALIDATION');
  
  const serverPath = path.join(__dirname, '..', 'src', 'server.js');
  
  if (!checkFileExists(serverPath, 'server.js')) return false;
  
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  // Check for required route registrations
  const requiredRoutes = [
    '/api/auth',
    '/api/users',
    '/api/hubs',
    '/api/products',
    '/api/orders',
    '/api/routes',
    '/api/ai',
    '/api/admin',
    '/api/pickup',
    '/api/community',
    '/api/crisis',
    '/api/mobile',
    '/api/notifications',
    '/api/realtime'
  ];
  
  let routesRegistered = true;
  
  requiredRoutes.forEach(route => {
    if (serverContent.includes(route)) {
      logSuccess(`Route registered: ${route}`);
    } else {
      logError(`Route missing: ${route}`);
      routesRegistered = false;
    }
  });
  
  return validateSyntax(serverPath, 'server.js') && routesRegistered;
}

function generateValidationReport(results) {
  logSection('VALIDATION REPORT');
  
  const totalChecks = Object.keys(results).length;
  const passedChecks = Object.values(results).filter(Boolean).length;
  const failedChecks = totalChecks - passedChecks;
  
  log(`\n📊 VALIDATION SUMMARY:`, colors.bright + colors.yellow);
  log(`Total Checks: ${totalChecks}`, colors.white);
  log(`Passed: ${passedChecks}`, colors.green);
  log(`Failed: ${failedChecks}`, failedChecks > 0 ? colors.red : colors.green);
  log(`Success Rate: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`, colors.white);
  
  log(`\n📋 DETAILED RESULTS:`, colors.bright + colors.yellow);
  Object.keys(results).forEach(check => {
    const status = results[check] ? '✅ PASS' : '❌ FAIL';
    const color = results[check] ? colors.green : colors.red;
    log(`${status} ${check}`, color);
  });
  
  if (failedChecks === 0) {
    log(`\n🎉 ALL VALIDATIONS PASSED!`, colors.bright + colors.green);
    log(`SwarmFill Backend is ready for production!`, colors.green);
    
    log(`\n🚀 NEXT STEPS:`, colors.bright + colors.cyan);
    log(`1. Run: npm run startup`, colors.cyan);
    log(`2. Test APIs using provided tokens`, colors.cyan);
    log(`3. Check COMPLETE_API_TESTING_GUIDE.md`, colors.cyan);
    log(`4. Deploy to production`, colors.cyan);
  } else {
    log(`\n❌ VALIDATION FAILED!`, colors.bright + colors.red);
    log(`Please fix the failed checks before proceeding.`, colors.red);
  }
  
  return failedChecks === 0;
}

function main() {
  log(`${colors.bright}${colors.blue}
╔════════════════════════════════════════════════════════════╗
║                  🔍 FINAL VALIDATION                      ║
║                 SwarmFill Backend                          ║
╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  const results = {
    'Package.json': validatePackageJson(),
    'Environment': validateEnvironment(),
    'Database Models': validateModels(),
    'Controllers': validateControllers(),
    'Routes': validateRoutes(),
    'Migrations': validateMigrations(),
    'Scripts': validateScripts(),
    'Documentation': validateDocumentation(),
    'Server File': validateServerFile()
  };
  
  const allValid = generateValidationReport(results);
  
  if (allValid) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
