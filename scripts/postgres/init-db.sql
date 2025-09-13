-- Initialize database schema
-- This file will be executed when the PostgreSQL container starts for the first time

-- Create extensions if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
-- Example table structure (modify as needed for your application)
-- CREATE TABLE IF NOT EXISTS users (
--     id SERIAL PRIMARY KEY,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     name VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Add any additional initialization SQL here
-- For example, inserting default data:
-- INSERT INTO users (email, name) VALUES ('admin@example.com', 'Admin User');

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE ruff TO ruff_user; 
