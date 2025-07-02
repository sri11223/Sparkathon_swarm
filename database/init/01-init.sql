-- Enable PostGIS extension for geographic data types
CREATE EXTENSION IF NOT EXISTS postgis;

-- USERS Table: Stores all user types (customers, hub owners, couriers, admins)
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'hub_owner', 'courier', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HUBS Table: Represents community micro-warehouses
CREATE TABLE IF NOT EXISTS hubs (
    hub_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(user_id),
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326), -- Stores longitude and latitude
    capacity_m3 NUMERIC(10, 2) NOT NULL,
    current_utilization_m3 NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'active', 'inactive', 'crisis_mode')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS Table: Catalog of all products available in the network
CREATE TABLE IF NOT EXISTS products (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL, -- Walmart SKU
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    volume_m3 NUMERIC(10, 4) NOT NULL, -- Volume in cubic meters
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HUB_INVENTORY Table: Join table for products in hubs
CREATE TABLE IF NOT EXISTS hub_inventory (
    hub_id UUID NOT NULL REFERENCES hubs(hub_id),
    product_id UUID NOT NULL REFERENCES products(product_id),
    quantity INT NOT NULL CHECK (quantity >= 0),
    available_quantity INT NOT NULL CHECK (available_quantity >= 0),
    last_stocked_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (hub_id, product_id)
);

-- ORDERS Table: Tracks customer orders
CREATE TABLE IF NOT EXISTS orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(user_id),
    hub_id UUID NOT NULL REFERENCES hubs(hub_id),
    status VARCHAR(30) NOT NULL CHECK (status IN ('pending', 'confirmed', 'ready_for_pickup', 'out_for_delivery', 'completed', 'cancelled')),
    order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('delivery', 'drive_thru_pickup')),
    total_price NUMERIC(10, 2) NOT NULL,
    pickup_code VARCHAR(10), -- For Drive-Thru security
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER_ITEMS Table: Join table for products in orders
CREATE TABLE IF NOT EXISTS order_items (
    order_id UUID NOT NULL REFERENCES orders(order_id),
    product_id UUID NOT NULL REFERENCES products(product_id),
    quantity INT NOT NULL CHECK (quantity > 0),
    price_per_unit NUMERIC(10, 2) NOT NULL,
    PRIMARY KEY (order_id, product_id)
);

-- DELIVERIES Table: Manages the last-mile delivery leg of an order
CREATE TABLE IF NOT EXISTS deliveries (
    delivery_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(order_id),
    courier_id UUID REFERENCES users(user_id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'failed')),
    start_location GEOGRAPHY(POINT, 4326),
    end_location GEOGRAPHY(POINT, 4326),
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    earnings NUMERIC(10, 2)
);

-- Create indexes for foreign keys and frequently queried columns
CREATE INDEX IF NOT EXISTS idx_hubs_owner_id ON hubs(owner_id);
CREATE INDEX IF NOT EXISTS idx_hubs_location ON hubs USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_hub_id ON orders(hub_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_courier_id ON deliveries(courier_id);