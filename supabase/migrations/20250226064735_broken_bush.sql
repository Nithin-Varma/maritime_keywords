/*
  # Create keywords table for maritime logistics

  1. New Tables
    - `keywords`
      - `id` (serial, primary key)
      - `term` (text, unique)
      - `category` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `keywords` table
    - Add policies for authenticated users to:
      - Read all keywords
      - Insert new keywords
      - Delete their own keywords
*/

CREATE TABLE IF NOT EXISTS keywords (
  id serial PRIMARY KEY,
  term text UNIQUE NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all keywords
CREATE POLICY "Anyone can read keywords"
  ON keywords
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert new keywords
CREATE POLICY "Authenticated users can insert keywords"
  ON keywords
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to delete keywords
CREATE POLICY "Authenticated users can delete keywords"
  ON keywords
  FOR DELETE
  TO authenticated
  USING (true);