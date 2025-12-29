/*
  # Tamil News Summarizer Database Schema

  1. New Tables
    - `summaries`
      - `id` (uuid, primary key) - Unique identifier for each summary
      - `original_text` (text) - Original Tamil text input
      - `summarized_text` (text) - Summarized Tamil text
      - `translated_text` (text, nullable) - English translation of summary
      - `created_at` (timestamptz) - Timestamp of creation
      - `word_count_original` (integer) - Word count of original text
      - `word_count_summary` (integer) - Word count of summarized text
  
  2. Security
    - Enable RLS on `summaries` table
    - Add policy for public read access (for demo purposes)
    - Add policy for public insert access (for demo purposes)
  
  ## Notes
  - This is a public demo app, so we're allowing unauthenticated access
  - In production, you may want to restrict this to authenticated users only
*/

CREATE TABLE IF NOT EXISTS summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_text text NOT NULL,
  summarized_text text NOT NULL,
  translated_text text,
  created_at timestamptz DEFAULT now(),
  word_count_original integer DEFAULT 0,
  word_count_summary integer DEFAULT 0
);

ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON summaries
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access"
  ON summaries
  FOR INSERT
  TO anon
  WITH CHECK (true);