# Phase 2: Supabase Backend & Authentication

## Goal
Set up the Supabase project, create the database schema with pgvector, implement the `match_notes` RPC, and wire up authentication.

## Prerequisites
- Supabase project created via dashboard (URL + anon key in `.env.local`).
- Phase 1 complete.

## Steps

### 2.1 — Enable pgvector Extension
Run in Supabase SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2.2 — Create Tables
Run in Supabase SQL Editor:
```sql
-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  embedding VECTOR(1536),
  status TEXT NOT NULL DEFAULT 'inbox' CHECK (status IN ('inbox', 'stored', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_notes_user_status ON notes(user_id, status);
CREATE INDEX idx_notes_embedding ON notes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Merge events table
CREATE TABLE merge_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  child_note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  merged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.3 — Create `match_notes` RPC
```sql
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
    1 - (n.embedding <=> query_embedding) AS similarity
  FROM notes n
  WHERE n.user_id = current_user_id
    AND n.status = 'stored'
    AND 1 - (n.embedding <=> query_embedding) > match_threshold
  ORDER BY n.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### 2.4 — Row-Level Security (RLS)
```sql
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own notes"
  ON notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE merge_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own merge events"
  ON merge_events FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM notes WHERE notes.id = merge_events.parent_note_id AND notes.user_id = auth.uid())
  );
```

### 2.5 — Supabase Client in App
In `lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

### 2.6 — Auth Screens (Stretch)
- Simple email/password sign-up and sign-in screens.
- Use `supabase.auth.signUp()` and `supabase.auth.signInWithPassword()`.
- Protect routes with an auth guard that redirects unauthenticated users.

## Verification
- Tables exist in Supabase dashboard with correct columns and types.
- `match_notes` RPC returns results when called with test data.
- Supabase client connects from the app without errors.
- RLS prevents cross-user data access.

## Dependencies
- Phase 1 (project shell exists).

## Outputs
- Fully configured Supabase backend with schema, RPC, RLS, and auth wiring.
