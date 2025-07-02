# SwarmFill Network - New Database Tables Documentation

This document describes all the new database tables and models added to the SwarmFill Network backend to support advanced features like gamification, promotions, returns, reviews, and system management.

## 📊 Overview of New Tables

**Total New Tables Added:** 17 tables
**New Models Created:** 10 Sequelize models
**Migration Files:** 2 comprehensive migrations

---

## 🎮 Gamification & User Engagement Tables

### 1. `user_achievements`
**Purpose:** Tracks user achievements and milestones in the platform
**Model:** `UserAchievement.js`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users table |
| `achievement_type` | ENUM | Type of achievement earned |
| `points_awarded` | INTEGER | Points given for this achievement |
| `metadata` | JSONB | Additional achievement data |
| `achieved_at` | TIMESTAMP | When achievement was earned |

**Achievement Types:**
- `first_order` - User's first successful order
- `loyal_customer` - Regular customer milestone
- `big_spender` - High-value purchase milestone
- `frequent_buyer` - Multiple orders in timeframe
- `early_adopter` - Early platform user
- `hub_supporter` - Supports local hubs
- `perfect_rating` - Maintains high ratings
- `review_writer` - Active reviewer
- `referral_master` - Successful referrals
- `eco_warrior` - Sustainable choices
- `streak_master` - Consecutive order streaks
- `bulk_buyer` - Large quantity purchases

### 2. `leaderboard`
**Purpose:** Maintains user rankings across different categories
**Model:** `Leaderboard.js`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users table |
| `category` | ENUM | Leaderboard category |
| `score` | DECIMAL | User's score in this category |
| `rank` | INTEGER | Current rank position |
| `last_updated` | TIMESTAMP | Last rank calculation |

**Leaderboard Categories:**
- `overall` - General platform activity
- `monthly` - Monthly performance
- `weekly` - Weekly performance
- `orders` - Based on order count
- `spending` - Based on total spending
- `reviews` - Based on review activity

### 3. `product_reviews`
**Purpose:** Product review and rating system
**Model:** `ProductReview.js`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `product_id` | UUID | Foreign key to products table |
| `user_id` | UUID | Foreign key to users table |
| `order_id` | UUID | Foreign key to orders table |
| `rating` | INTEGER | 1-5 star rating |
| `review_text` | TEXT | Written review content |
| `photos` | JSON | Array of photo URLs |
| `is_verified` | BOOLEAN | Verified purchase review |
| `helpful_count` | INTEGER | Helpful votes count |
| `metadata` | JSONB | Additional review data |
| `created_at` | TIMESTAMP | Review creation time |
| `updated_at` | TIMESTAMP | Last update time |

---

## 💰 Business & Marketing Tables

### 4. `promotions`
**Purpose:** Manages discount codes, coupons, and promotional campaigns
**Model:** `Promotion.js`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `code` | STRING | Unique promotion code |
| `title` | STRING | Promotion title |
| `description` | TEXT | Promotion description |
| `promotion_type` | ENUM | Type of promotion |
| `discount_value` | DECIMAL | Fixed discount amount |
| `discount_percentage` | DECIMAL | Percentage discount |
| `minimum_order_amount` | DECIMAL | Minimum order requirement |
| `maximum_discount_amount` | DECIMAL | Maximum discount cap |
| `usage_limit_per_user` | INTEGER | Per-user usage limit |
| `total_usage_limit` | INTEGER | Total usage limit |
| `current_usage_count` | INTEGER | Current usage count |
| `start_date` | TIMESTAMP | Promotion start date |
| `end_date` | TIMESTAMP | Promotion end date |
| `is_active` | BOOLEAN | Active status |
| `terms_and_conditions` | TEXT | T&C text |
| `target_user_criteria` | JSONB | User targeting rules |
| `applicable_products` | JSON | Applicable product IDs |
| `applicable_categories` | JSON | Applicable categories |

**Promotion Types:**
- `fixed_amount` - Fixed dollar discount
- `percentage` - Percentage discount
- `free_shipping` - Free delivery
- `buy_one_get_one` - BOGO offers

### 5. `user_promotion_usage`
**Purpose:** Tracks which users used which promotions
**Model:** `UserPromotionUsage.js`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users table |
| `promotion_id` | UUID | Foreign key to promotions table |
| `order_id` | UUID | Foreign key to orders table |
| `discount_amount` | DECIMAL | Actual discount applied |
| `used_at` | TIMESTAMP | Usage timestamp |

### 6. `returns`
**Purpose:** Manages product return and refund requests
**Model:** `Return.js`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `order_id` | UUID | Foreign key to orders table |
| `product_id` | UUID | Foreign key to products table |
| `customer_id` | UUID | Foreign key to users table |
| `hub_id` | UUID | Foreign key to hubs table |
| `quantity` | INTEGER | Quantity being returned |
| `reason` | ENUM | Return reason |
| `description` | TEXT | Detailed return description |
| `photos` | JSON | Evidence photos |
| `status` | ENUM | Return processing status |
| `admin_notes` | TEXT | Internal processing notes |
| `refund_amount` | DECIMAL | Approved refund amount |
| `requested_at` | TIMESTAMP | Return request time |
| `approved_at` | TIMESTAMP | Approval timestamp |
| `rejected_at` | TIMESTAMP | Rejection timestamp |
| `processing_started_at` | TIMESTAMP | Processing start time |
| `completed_at` | TIMESTAMP | Completion timestamp |
| `cancelled_at` | TIMESTAMP | Cancellation timestamp |

**Return Reasons:**
- `defective` - Product defect
- `wrong_item` - Wrong item received
- `not_as_described` - Description mismatch
- `size_issue` - Size problems
- `quality_issue` - Quality concerns
- `damaged_shipping` - Shipping damage
- `changed_mind` - Customer changed mind
- `other` - Other reasons

**Return Statuses:**
- `requested` - Initial request
- `approved` - Approved for return
- `rejected` - Return denied
- `processing` - Being processed
- `completed` - Return completed
- `cancelled` - Request cancelled

---

## 🔔 Communication & Preferences Tables

### 7. `notification_preferences`
**Purpose:** Manages user notification settings and preferences
**Model:** `NotificationPreference.js`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users table |
| `email_notifications` | BOOLEAN | Email notifications enabled |
| `sms_notifications` | BOOLEAN | SMS notifications enabled |
| `push_notifications` | BOOLEAN | Push notifications enabled |
| `order_updates` | BOOLEAN | Order status updates |
| `delivery_updates` | BOOLEAN | Delivery notifications |
| `promotion_alerts` | BOOLEAN | Promotion notifications |
| `price_drop_alerts` | BOOLEAN | Price drop alerts |
| `inventory_alerts` | BOOLEAN | Stock alerts |
| `newsletter_subscription` | BOOLEAN | Newsletter subscription |
| `review_reminders` | BOOLEAN | Review reminders |
| `security_alerts` | BOOLEAN | Security notifications |
| `marketing_emails` | BOOLEAN | Marketing emails |
| `notification_frequency` | ENUM | Frequency preference |
| `quiet_hours_start` | TIME | Quiet period start |
| `quiet_hours_end` | TIME | Quiet period end |
| `timezone` | STRING | User timezone |

**Notification Frequencies:**
- `immediate` - Real-time notifications
- `daily` - Daily digest
- `weekly` - Weekly summary
- `never` - Disabled

---

## ⚙️ System Management Tables

### 8. `system_configurations`
**Purpose:** Stores application-wide configuration settings
**Model:** `SystemConfiguration.js`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `config_key` | STRING | Unique configuration key |
| `config_value` | TEXT | Configuration value |
| `category` | STRING | Configuration category |
| `description` | TEXT | Configuration description |
| `data_type` | ENUM | Value data type |
| `allowed_values` | JSON | Valid values array |
| `is_active` | BOOLEAN | Active status |
| `is_sensitive` | BOOLEAN | Sensitive data flag |
| `requires_restart` | BOOLEAN | Restart requirement flag |
| `created_by` | UUID | Creator user ID |
| `updated_by` | UUID | Last updater user ID |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Configuration Categories:**
- `general` - General app settings
- `payment` - Payment configurations
- `delivery` - Delivery settings
- `security` - Security parameters
- `ai` - AI system settings
- `notifications` - Notification settings
- `features` - Feature flags
- `limits` - System limits

**Data Types:**
- `string` - Text values
- `number` - Numeric values
- `boolean` - True/false values
- `array` - JSON arrays
- `object` - JSON objects
- `enum` - Enumerated values

### 9. `courier_vehicles`
**Purpose:** Stores courier vehicle information for delivery optimization
**Model:** `CourierVehicle.js`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `courier_id` | UUID | Foreign key to users table |
| `vehicle_type` | ENUM | Type of vehicle |
| `make` | STRING | Vehicle manufacturer |
| `model` | STRING | Vehicle model |
| `year` | INTEGER | Manufacturing year |
| `license_plate` | STRING | License plate number |
| `color` | STRING | Vehicle color |
| `capacity_kg` | DECIMAL | Weight capacity |
| `capacity_m3` | DECIMAL | Volume capacity |
| `fuel_type` | ENUM | Fuel type |
| `insurance_expiry` | DATE | Insurance expiration |
| `registration_expiry` | DATE | Registration expiration |
| `is_active` | BOOLEAN | Active status |
| `created_at` | TIMESTAMP | Registration time |
| `updated_at` | TIMESTAMP | Last update time |

**Vehicle Types:**
- `bicycle` - Bicycle delivery
- `motorcycle` - Motorcycle delivery
- `car` - Car delivery
- `van` - Van delivery
- `truck` - Truck delivery
- `electric_bike` - E-bike delivery
- `electric_car` - Electric car delivery

**Fuel Types:**
- `gasoline` - Gasoline powered
- `diesel` - Diesel powered
- `electric` - Electric powered
- `hybrid` - Hybrid powered
- `manual` - Manual (bicycle)

### 10. `ai_optimization_logs`
**Purpose:** Logs AI system operations and optimizations
**Model:** `AIOptimizationLog.js`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `optimization_type` | ENUM | Type of optimization |
| `target_entity_type` | STRING | Target entity (hub, product, etc.) |
| `target_entity_id` | UUID | Target entity ID |
| `input_data` | JSONB | Input data for optimization |
| `output_data` | JSONB | Optimization results |
| `confidence_score` | DECIMAL | AI confidence level |
| `execution_time_ms` | INTEGER | Processing time |
| `status` | ENUM | Processing status |
| `error_message` | TEXT | Error details if any |
| `model_version` | STRING | AI model version used |
| `created_at` | TIMESTAMP | Log creation time |

**Optimization Types:**
- `inventory_prediction` - Stock level predictions
- `demand_forecasting` - Demand predictions
- `price_optimization` - Dynamic pricing
- `route_optimization` - Delivery routes
- `recommendation_engine` - Product recommendations
- `capacity_planning` - Hub capacity planning

**Status Values:**
- `pending` - Queued for processing
- `processing` - Currently running
- `completed` - Successfully completed
- `failed` - Processing failed
- `cancelled` - Operation cancelled

---

## 📈 Analytics & Tracking Tables

### 11. `payments`
**Purpose:** Comprehensive payment processing and tracking
**Features:**
- Multiple payment gateways support
- Payment status tracking
- Refund management
- Transaction logging

### 12. `user_ratings`
**Purpose:** Rating system for users, hubs, and services
**Features:**
- Multi-entity rating support
- Review text with ratings
- Rating aggregation
- Moderation capabilities

### 13. `notifications`
**Purpose:** System-wide notification management
**Features:**
- Multiple notification types
- Read/unread tracking
- Rich notification data
- Action URLs

### 14. `analytics_events`
**Purpose:** User behavior and system analytics tracking
**Features:**
- Event categorization
- Session tracking
- User agent logging
- Custom event data

### 15. `support_tickets`
**Purpose:** Customer support and ticket management system
**Features:**
- Priority-based ticketing
- Assignment workflow
- Category-based organization
- Resolution tracking

### 16. `ai_recommendations`
**Purpose:** AI-powered recommendations for hubs and products
**Features:**
- Multiple recommendation types
- Confidence scoring
- Application tracking
- Reasoning explanations

### 17. `emergency_contacts`
**Purpose:** Emergency contact management for crisis mode
**Features:**
- Multiple contacts per user
- Relationship tracking
- Primary contact designation
- Crisis mode integration

---

## 🔗 Table Relationships & Associations

### Key Relationships:
1. **Users** are central to most tables (customers, couriers, hub owners)
2. **Orders** connect to payments, ratings, returns, and support tickets
3. **Products** link to reviews, returns, recommendations, and inventory
4. **Hubs** connect to orders, ratings, returns, and AI recommendations
5. **Promotions** track usage through user_promotion_usage junction table

### Foreign Key Constraints:
- **CASCADE DELETE**: Child records deleted when parent is deleted
- **SET NULL**: Foreign key set to null when parent is deleted
- **RESTRICT**: Prevents deletion if child records exist

### Indexes for Performance:
- **Primary keys**: UUID indexes on all tables
- **Foreign keys**: Indexes on all foreign key columns
- **Search fields**: Indexes on frequently queried columns
- **Composite indexes**: Multi-column indexes for complex queries
- **JSON indexes**: GIN indexes for JSONB columns
- **Geographic indexes**: GIST indexes for location fields

---

## 🚀 Integration Points

### API Endpoints:
Each table has corresponding REST API endpoints for:
- **CRUD operations** (Create, Read, Update, Delete)
- **Search and filtering**
- **Pagination**
- **Sorting**
- **Analytics and reporting**

### Real-time Features:
- **WebSocket integration** for live updates
- **Event-driven notifications**
- **Live inventory tracking**
- **Real-time order status**

### AI Integration:
- **Machine learning data sources**
- **Prediction input/output storage**
- **Model performance tracking**
- **Optimization result logging**

---

## 📊 Data Scalability

### Performance Optimizations:
1. **Proper indexing strategy** for fast queries
2. **JSON fields** for flexible schema evolution
3. **Partitioning ready** for large datasets
4. **Efficient foreign key relationships**
5. **Optimized data types** for storage efficiency

### Future Extensibility:
1. **Metadata fields** for additional data without schema changes
2. **ENUM extensibility** for new values
3. **JSON configuration** for flexible settings
4. **Modular design** for easy feature additions

This comprehensive table structure provides a solid foundation for all current and future SwarmFill Network features, ensuring scalability, performance, and maintainability.
