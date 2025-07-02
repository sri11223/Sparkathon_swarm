# Database Migration Guide (Sequelize)

This guide explains the correct, non-destructive process for altering the database schema after it has been initially created. We use a tool called `sequelize-cli` to run migrations.

## Why Use Migrations?

Directly changing the database (e.g., by connecting with a GUI and adding a column) or rebuilding it from scratch is slow, error-prone, and destructive. Migrations solve this by treating your database schema as version-controlled code.

- **Safe:** Changes are scripted and repeatable.
- **Non-Destructive:** They alter tables without deleting your existing data.
- **Version-Controlled:** Each change is a file that you commit to Git, so your application code and database schema always stay in sync.
- **Reversible:** Every migration has an `up` (apply) and a `down` (undo) function.

## The Workflow for Making a Schema Change

Follow these steps every time you need to alter the database (e.g., add/remove a column, create a new table).

### Step 1: Install Dependencies (First Time Only)

If you haven't already, make sure the necessary packages are installed.

```bash
# Install the Sequelize CLI tool
npm install --save-dev sequelize-cli

# Install the PostgreSQL driver for Node.js
npm install pg pg-hstore
```

### Step 2: Ensure Docker Services are Running

The database container must be running to apply migrations. From the project root directory, run:

```bash
docker-compose up -d
```
You can confirm the `swarmfill_postgres` container is running with `docker ps`.

### Step 3: Create a New Migration File

Generate a new migration file from within the `backend` directory. Give it a descriptive name.

**Example:** To add a `last_login_at` column to the `users` table.

```bash
# Run this command inside the 'backend' directory
npx sequelize-cli migration:generate --name add-last-login-at-to-users
```
This will create a new file in the `backend/migrations/` directory with a timestamped name.

### Step 4: Edit the Migration File

Open the newly created file and fill in the `up` and `down` methods.

- **`up`**: The change you want to apply.
- **`down`**: The code to reverse the change.

#### Example: Adding a Column
```javascript
'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    // Use the queryInterface to add a new column to the 'users' table
    await queryInterface.addColumn('users', 'last_login_at', {
      type: Sequelize.DATE,
      allowNull: true, // It's good practice to allow null for new columns
    });
  },

  async down (queryInterface, Sequelize) {
    // The 'down' function should do the opposite
    await queryInterface.removeColumn('users', 'last_login_at');
  }
};
```

#### Example: Creating a New Table
To create a new table, use the `createTable` method in the `up` function and `dropTable` in the `down` function.

```javascript
'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('new_features', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      // Foreign Key Example
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users', // This is the name of the table, not the model
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('new_features');
  }
};
```

### Step 5: Run the Migration

Execute the migration command from within the `backend` directory. This will run the `up` method on all new migration files.

```bash
# Run this command inside the 'backend' directory
npx sequelize-cli db:migrate
```
The CLI will connect to the database, apply the changes, and log its activity. Your database is now updated.

### Step 6: Update the Sequelize Model

The final and most important step is to update the corresponding model file in `backend/src/models/` to reflect the database change. If you added the `last_login_at` column, you must also add it to the `User.js` model file.

**Example (`User.js`):**
```javascript
// ... inside User.init({ ... })
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    last_login_at: { // Add the new field here
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
// ...
```

By following these steps, you ensure the database and the application code are always synchronized in a safe and manageable way.
