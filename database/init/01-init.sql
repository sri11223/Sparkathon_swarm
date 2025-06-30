-- Initialize SwarmFill Database
-- This script sets up the basic database structure and extensions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis" SCHEMA public;

-- Create custom types/enums (these will be managed by Sequelize, but useful for reference)
-- User types
-- DO $$ BEGIN
--     CREATE TYPE user_type_enum AS ENUM ('customer', 'hubowner', 'courier', 'admin');
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;

-- Vehicle types
-- DO $$ BEGIN
--     CREATE TYPE vehicle_type_enum AS ENUM ('bike', 'car', 'van', 'truck');
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;

-- Order status
-- DO $$ BEGIN
--     CREATE TYPE order_status_enum AS ENUM ('pending', 'confirmed', 'preparing', 'ready_pickup', 'in_transit', 'delivered', 'cancelled');
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;

-- Payment status
-- DO $$ BEGIN
--     CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'failed', 'refunded');
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;

-- Hub types
-- DO $$ BEGIN
--     CREATE TYPE hub_type_enum AS ENUM ('warehouse', 'retail', 'pickup_point');
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;

-- Create indexes for better performance (will be created by Sequelize migrations)
-- These are just for reference

-- User indexes
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_type ON users(user_type);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_location ON users USING GIST(ST_MakePoint(longitude, latitude));

-- Hub indexes
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hubs_owner ON hubs(owner_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hubs_location ON hubs USING GIST(ST_MakePoint(longitude, latitude));
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hubs_active ON hubs(is_active);

-- Order indexes
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer ON orders(customer_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_courier ON orders(courier_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON orders(status);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_date ON orders(order_date);

-- Inventory indexes
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_hub_product ON inventory(hub_id, product_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_available ON inventory(is_available);

-- Create functions for common operations

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, lon1 DECIMAL, 
    lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    RETURN (
        6371 * acos(
            cos(radians(lat1)) * 
            cos(radians(lat2)) * 
            cos(radians(lon2) - radians(lon1)) + 
            sin(radians(lat1)) * 
            sin(radians(lat2))
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to find nearby hubs
CREATE OR REPLACE FUNCTION find_nearby_hubs(
    user_lat DECIMAL, 
    user_lon DECIMAL, 
    radius_km DECIMAL DEFAULT 10
) RETURNS TABLE(
    hub_id UUID,
    hub_name VARCHAR,
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.name,
        calculate_distance(user_lat, user_lon, h.latitude, h.longitude) as distance
    FROM hubs h
    WHERE 
        h.is_active = true
        AND calculate_distance(user_lat, user_lon, h.latitude, h.longitude) <= radius_km
    ORDER BY distance;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to update courier rating
CREATE OR REPLACE FUNCTION update_courier_rating(
    courier_uuid UUID,
    new_rating DECIMAL
) RETURNS VOID AS $$
DECLARE
    current_rating DECIMAL;
    current_deliveries INTEGER;
    new_average DECIMAL;
BEGIN
    SELECT rating, total_deliveries 
    INTO current_rating, current_deliveries
    FROM users 
    WHERE id = courier_uuid AND user_type = 'courier';
    
    IF current_deliveries = 0 THEN
        new_average := new_rating;
    ELSE
        new_average := ((current_rating * current_deliveries) + new_rating) / (current_deliveries + 1);
    END IF;
    
    UPDATE users 
    SET 
        rating = new_average,
        total_deliveries = current_deliveries + 1
    WHERE id = courier_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO swarmfill_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO swarmfill_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO swarmfill_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO swarmfill_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO swarmfill_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO swarmfill_user;
