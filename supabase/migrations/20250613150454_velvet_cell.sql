/*
  # Create papers table for storing analyzed papers

  1. New Tables
    - `papers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `doi` (text, nullable)
      - `abstract` (text, nullable)
      - `input_type` (text - 'doi', 'abstract', 'pdf')
      - `academic_level` (text)
      - `analysis` (jsonb - stores PaperAnalysis object)
      - `notes` (text, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `papers` table
    - Add policies for authenticated users to manage their own papers
*/

CREATE TABLE IF NOT EXISTS papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  doi text,
  abstract text,
  input_type text NOT NULL CHECK (input_type IN ('doi', 'abstract', 'pdf')),
  academic_level text NOT NULL DEFAULT 'undergraduate',
  analysis jsonb NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE papers ENABLE ROW LEVEL SECURITY;

-- Policy for users to insert their own papers
CREATE POLICY "Users can insert own papers"
  ON papers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to read their own papers
CREATE POLICY "Users can read own papers"
  ON papers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to update their own papers
CREATE POLICY "Users can update own papers"
  ON papers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own papers
CREATE POLICY "Users can delete own papers"
  ON papers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS papers_user_id_idx ON papers(user_id);
CREATE INDEX IF NOT EXISTS papers_created_at_idx ON papers(created_at DESC);