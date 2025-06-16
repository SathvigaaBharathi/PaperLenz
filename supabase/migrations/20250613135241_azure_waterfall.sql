/*
  # Create users table for authentication and profiles

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users.id)
      - `email` (text, unique, not null)
      - `academic_level` (text, default 'undergraduate')
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `users` table
    - Add policy for authenticated users to read their own data
    - Add policy for authenticated users to update their own data
    - Add policy for users to insert their own profile during signup

  3. Changes
    - Links user profiles to Supabase auth system
    - Provides academic level tracking for personalized analysis
    - Ensures data security with row-level security policies
*/

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  academic_level text DEFAULT 'undergraduate' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for the users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);