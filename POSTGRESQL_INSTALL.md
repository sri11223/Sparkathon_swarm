# 🚀 PostgreSQL Fresh Installation Guide

## Step 1: Download PostgreSQL
1. Go to: https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Choose the latest version (16.x)
4. Download the Windows x86-64 installer

## Step 2: Run Installation
1. **Right-click** the downloaded file → **Run as administrator**
2. **Installation wizard settings**:
   - Installation Directory: `C:\Program Files\PostgreSQL\16`
   - Select Components: Check ALL (PostgreSQL Server, pgAdmin 4, Stack Builder, Command Line Tools)
   - Data Directory: `C:\Program Files\PostgreSQL\16\data`
   - **PASSWORD**: Set a strong password for 'postgres' user (WRITE IT DOWN!)
   - Port: `5432` (default)
   - Advanced Options: Default locale
   - Pre Installation Summary: Review and click Next
   - Ready to Install: Click Next

## Step 3: Post-Installation Setup
1. **Add to PATH manually**:
   - Open Start Menu → Type "Environment Variables"
   - Click "Edit the system environment variables"
   - Click "Environment Variables" button
   - Under "System Variables", find and select "Path"
   - Click "Edit" → "New"
   - Add: `C:\Program Files\PostgreSQL\16\bin`
   - Click OK on all dialogs

2. **Restart PowerShell/Command Prompt**

## Step 4: Test Installation
Open NEW PowerShell window:
```powershell
psql --version
```
Should show: `psql (PostgreSQL) 16.x`

## Step 5: Create SwarmFill Database
```powershell
# Connect to PostgreSQL (will ask for postgres user password)
psql -U postgres

# Create database and user
CREATE DATABASE swarmfill_db;
CREATE USER swarmfill_user WITH PASSWORD 'swarmfill_password_2024';
GRANT ALL PRIVILEGES ON DATABASE swarmfill_db TO swarmfill_user;
ALTER USER swarmfill_user CREATEDB;
\q
```

## If Installation Fails
Try these alternatives:
1. Download from: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
2. Use the Stack Builder that comes with PostgreSQL
3. Try PostgreSQL portable version
