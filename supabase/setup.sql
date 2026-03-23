-- TriageNotes: Supabase Database Setup
-- Run this in the Supabase SQL Editor

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  embedding VECTOR(1536),
  status TEXT NOT NULL DEFAULT 'inbox'
    CHECK (status IN ('inbox', 'stored', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_notes_user_status ON notes(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notes_embedding ON notes
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 4. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 5. Merge events table
CREATE TABLE IF NOT EXISTS merge_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  child_note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  merged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. match_notes RPC for vector similarity search
CREATE OR REPLACE FUNCTION match_notes(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  current_user_id UUID
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id,
    n.content,
    (1 - (n.embedding <=> query_embedding))::FLOAT AS similarity
  FROM notes n
  WHERE n.user_id = current_user_id
    AND n.status = 'stored'
    AND n.embedding IS NOT NULL
    AND 1 - (n.embedding <=> query_embedding) > match_threshold
  ORDER BY n.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 7. Row-Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own notes"
  ON notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE merge_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own merge events"
  ON merge_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = merge_events.parent_note_id
        AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read their own merge events"
  ON merge_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = merge_events.parent_note_id
        AND notes.user_id = auth.uid()
    )
  );
