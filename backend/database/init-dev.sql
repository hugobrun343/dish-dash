-- Development database initialization
-- This file creates tables for development

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    servings INTEGER NOT NULL DEFAULT 1,
    ingredients JSONB NOT NULL,
    instructions TEXT NOT NULL,
    cooking_time INTEGER, -- in minutes
    prep_time INTEGER, -- in minutes
    difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 10), -- 1=easy, 10=expert
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saved_recipes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, recipe_id)
);

CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    dietary_restrictions JSONB, -- vegetarian, vegan, gluten-free, etc.
    allergies JSONB, -- nuts, dairy, shellfish, etc.
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);