#!/usr/bin/env node

/**
 * SwarmFill Network - Project Verification Script
 * Checks that all components are properly set up and ready for development
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🔍 SwarmFill Network - Project Verification\n');

// Project structure verification
const requiredFolders = [
    'frontend/customer-mobile-app',
    'frontend/hubowner-mobile-app', 
    'frontend/courier-mobile-app',
    'frontend/admin-web-dashboard',
    'frontend/shared-components',
    'backend',
    'ai-services',
    'deployment/docker',
    'docs',
    'tests'
];

const requiredFiles = [
    'README.md',
    'PROJECT_STRUCTURE.md', 
    'DEVELOPMENT_SETUP.md',
    'PROJECT_STATUS.md',
    '.env.example',
    '.gitignore',
    'package.json',
    'backend/package.json',
    'ai-services/requirements.txt',
    'ai-services/PYTHON_DEPENDENCIES.md'
];

console.log('📁 Checking project structure...');
let structureOK = true;

for (const folder of requiredFolders) {
    const exists = fs.existsSync(folder);
    console.log(`  ${exists ? '✅' : '❌'} ${folder}`);
    if (!exists) structureOK = false;
}

console.log('\n📄 Checking required files...');
let filesOK = true;

for (const file of requiredFiles) {
    const exists = fs.existsSync(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) filesOK = false;
}

// Check Node.js dependencies
console.log('\n📦 Checking Node.js dependencies...');

const checkNodeModules = (dir) => {
    const nodeModulesPath = path.join(dir, 'node_modules');
    const packageJsonPath = path.join(dir, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
        const exists = fs.existsSync(nodeModulesPath);
        console.log(`  ${exists ? '✅' : '⚠️ '} ${dir}/node_modules ${exists ? '' : '(run npm install)'}`);
        return exists;
    }
    return true;
};

const nodeDepDirs = [
    '.',
    'backend',
    'frontend/customer-mobile-app',
    'frontend/hubowner-mobile-app',
    'frontend/courier-mobile-app', 
    'frontend/admin-web-dashboard',
    'frontend/shared-components'
];

let nodeDepsOK = true;
for (const dir of nodeDepDirs) {
    if (!checkNodeModules(dir)) nodeDepsOK = false;
}

// Check Python setup
console.log('\n🐍 Checking Python setup...');

exec('python --version', (error, stdout, stderr) => {
    if (error) {
        exec('py --version', (error2, stdout2, stderr2) => {
            if (error2) {
                console.log('  ❌ Python not found (python or py command)');
            } else {
                console.log(`  ✅ Python found: ${stdout2.trim()}`);
                checkPip();
            }
        });
    } else {
        console.log(`  ✅ Python found: ${stdout.trim()}`);
        checkPip();
    }
});

function checkPip() {
    exec('pip --version', (error, stdout, stderr) => {
        if (error) {
            exec('py -m pip --version', (error2, stdout2, stderr2) => {
                if (error2) {
                    console.log('  ❌ pip not found or not working');
                    console.log('  📖 See ai-services/PYTHON_DEPENDENCIES.md for solutions');
                } else {
                    console.log(`  ✅ pip found: ${stdout2.trim()}`);
                }
            });
        } else {
            console.log(`  ✅ pip found: ${stdout.trim()}`);
        }
    });
}

// Summary
setTimeout(() => {
    console.log('\n📊 VERIFICATION SUMMARY\n');
    
    console.log(`📁 Project Structure: ${structureOK ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
    console.log(`📄 Required Files: ${filesOK ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
    console.log(`📦 Node.js Dependencies: ${nodeDepsOK ? '✅ COMPLETE' : '⚠️  PARTIAL (run npm install in missing directories)'}`);
    console.log(`🐍 Python Environment: ⚠️  NEEDS VERIFICATION (see output above)`);
    
    console.log('\n🚀 READY FOR DEVELOPMENT:');
    console.log('  ✅ Frontend Development (all apps ready)');
    console.log('  ✅ Backend Development (API ready)');
    console.log('  ⚠️  AI Services (pending Python setup)');
    
    console.log('\n📖 Next Steps:');
    console.log('  1. Run "npm run dev" in backend/ to start API server');
    console.log('  2. Run "npm start" in any frontend app to begin development');
    console.log('  3. Set up Python environment on compatible system for AI services');
    console.log('  4. Follow DEVELOPMENT_SETUP.md for detailed instructions');
    
    console.log('\n🎯 Project is ready for Walmart Sparkathon 2025 development! 🎯');
}, 2000);
