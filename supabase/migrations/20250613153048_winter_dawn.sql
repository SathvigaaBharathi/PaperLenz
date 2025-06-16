/*
  # Add username column to users table

  1. New Columns
    - `username` (text, unique, not null)
      - Unique identifier for each user
      - Generated from email for existing users

  2. Changes
    - Add username column to users table
    - Update existing users with generated usernames
    - Add unique constraint on username

  3. Security
    - Maintains existing RLS policies
    - Username uniqueness enforced at database level
*/

-- Add username column (initially nullable)
ALTER TABLE users ADD COLUMN IF NOT EXISTS username text;

-- Update existing users with placeholder usernames based on email
UPDATE users 
SET username = CONCAT('user_', SUBSTRING(email FROM 1 FOR POSITION('@' IN email) - 1), '_', SUBSTRING(id::text FROM 1 FOR 8))
WHERE username IS NULL;

-- Now make username NOT NULL
ALTER TABLE users ALTER COLUMN username SET NOT NULL;

-- Add unique constraint on username (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_username_key' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
  END IF;
END $$;

-- Create index on username for better query performance (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'users_username_idx' 
    AND tablename = 'users'
  ) THEN
    CREATE INDEX users_username_idx ON users (username);
  END IF;
END $$;