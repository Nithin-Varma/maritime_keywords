/*
  # Fix Keywords Table RLS Policies

  1. Changes
    - Update RLS policies to allow public access for keywords table
    - Enable anonymous access for read/write operations
    
  2. Security
    - Allow public access since this is a keyword collection system
    - No sensitive data is being stored
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read keywords" ON keywords;
DROP POLICY IF EXISTS "Authenticated users can insert keywords" ON keywords;
DROP POLICY IF EXISTS "Authenticated users can delete keywords" ON keywords;

-- Create new policies for public access
CREATE POLICY "Allow public read access"
  ON keywords
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access"
  ON keywords
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public delete access"
  ON keywords
  FOR DELETE
  TO public
  USING (true);