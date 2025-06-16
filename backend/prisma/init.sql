-- Initial database setup for IQ Test application
-- This file is executed when the PostgreSQL container starts

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Set timezone
SET timezone = 'UTC';

-- Create database if it doesn't exist (this is handled by Docker environment variables)
-- The database 'iq_test_db' is created automatically by the postgres container

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE iq_test_db TO iq_test_user;

-- Create schema for application (optional, using default public schema)
-- CREATE SCHEMA IF NOT EXISTS iq_test;

-- Set search path
-- SET search_path TO iq_test, public;

-- Note: Tables will be created by Prisma migrations
-- This file is mainly for initial database setup and extensions
