const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Inventory = sequelize.define('Inventory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    hub_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'hubs',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    reserved_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    cost_price: {
      type: DataTypes.DECIMAL(10, 2),
      validate: {
        min: 0
      }
    },
    expiry_date: {
      type: DataTypes.DATEONLY
    },
    batch_number: {
      type: DataTypes.STRING(50)
    },
    low_stock_threshold: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      validate: {
        min: 0
      }
    },
    location_in_hub: {
      type: DataTypes.STRING(100) // e.g., "Aisle 3, Shelf B"
    },
    supplier_info: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    last_restocked: {
      type: DataTypes.DATE
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'inventory',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_inventory_hub_product',
        fields: ['hub_id', 'product_id'],
        unique: true
      },
      {
        name: 'idx_inventory_low_stock',
        fields: ['quantity', 'low_stock_threshold']
      },
      {
        name: 'idx_inventory_expiry',
        fields: ['expiry_date']
      }
    ]
  });

  // Instance methods
  Inventory.prototype.getAvailableQuantity = function() {
    return this.quantity - this.reserved_quantity;
  };

  Inventory.prototype.isLowStock = function() {
    return this.quantity <= this.low_stock_threshold;
  };

  Inventory.prototype.isExpiringSoon = function(days = 7) {
    if (!this.expiry_date) return false;
    const expiryDate = new Date(this.expiry_date);
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + days);
    return expiryDate <= warningDate;
  };

  Inventory.prototype.reserveStock = function(quantity) {
    if (this.getAvailableQuantity() >= quantity) {
      this.reserved_quantity += quantity;
      return true;
    }
    return false;
  };

  Inventory.prototype.releaseReservedStock = function(quantity) {
    this.reserved_quantity = Math.max(0, this.reserved_quantity - quantity);
  };

  return Inventory;
};
