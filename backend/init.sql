-- Initialize PostgreSQL database for Waste Collection Service
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- The database 'waste_collection' is created automatically by POSTGRES_DB env var
-- No need to manually create it or grant privileges as postgres user already has access

-- Create schema for better organization (optional)
-- CREATE SCHEMA IF NOT EXISTS waste_collection;

-- Note: Tables will be created by Flask-Migrate/Alembic
-- This file can be used for any additional initialization 