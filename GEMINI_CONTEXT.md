# Gemini Context

This file helps Gemini remember the project context across chat sessions.

## Project Summary

**Problem Statement:**
The project addresses two primary challenges in modern logistics:
1.  **Inefficient Last-Mile Delivery:** Traditional delivery is slow (24-48 hours), expensive, and vulnerable to disruptions from crises or demand spikes.
2.  **Suboptimal Warehouse & Transportation Operations:** Inefficiencies in warehouse picking routes, truck loading, and delivery routes lead to increased operational costs.

**Objectives & Solution:**
The project, now framed as the **"Walmart Community Commerce & Logistics Platform,"** tackles these problems with an integrated, two-part solution:

1.  **SwarmFill Network:** A decentralized, community-driven micro-fulfillment network where local homes and businesses act as AI-curated mini-warehouses ("hubs"). This aims to make delivery significantly faster (15-minute pickup or 2-4 hour delivery) and more resilient.
2.  **SmartLoad AI:** An AI engine designed to optimize the entire logistics workflow, with a focus on hyper-local, personalized inventory management.

The overall goal is to create a system that dramatically cuts delivery costs and times, empowers local communities economically, and builds a supply chain that is deeply integrated with Walmart's existing infrastructure and data.

## Key Innovations

1.  **Hyper-Personalized Hubs:** Instead of just storing popular items, the AI will analyze local buying patterns from nearby Walmart stores to stock hubs with hyper-relevant products. The "Community Curation" feature will suggest a "starter inventory" for new hubs based on local demographics and purchase history.
2.  **"Drive-Thru" Hubs & In-Store Integration:** The platform will introduce new, convenient delivery options. "Drive-Thru" Hubs will allow customers to pick up orders directly from a hub owner's home. The platform will also integrate with Walmart's existing stores, allowing for in-store returns of items purchased from a hub.

## Backend Setup

We have successfully set up the foundational backend infrastructure using Docker Compose.

- **Services:** A `docker-compose.yml` file defines and configures the core services:
    - `postgres`: A PostGIS-enabled PostgreSQL database for data storage.
    - `redis`: For caching and session management.
    - `pgadmin`: A web-based administration tool for the PostgreSQL database.
- **Database Schema:** The initial database schema has been created via a SQL script (`database/init/01-init.sql`). It includes tables for users, hubs, products, inventory, orders, and deliveries, with PostGIS enabled for geospatial queries.
- **Next Steps:** With the database and services running, the next step is to build out the backend API endpoints to interact with the database. We will begin by creating the models and controllers for the `users` and `hubs` entities.
