# Phase 4: Embedding Pipeline

## Goal
Implement the AI embedding generation pipeline that converts note text into vector embeddings stored in Supabase for semantic search.

## Prerequisites
- Phase 2 (notes table with `embedding` vector column).
- Phase 3 (notes being created in the database).
- OpenAI or Gemini API key in `.env.local`.

## Steps

### 4.1 — AI Helper Module (`lib/ai.ts`)
```typescript
const EMBEDDING_MODEL = 'text-embedding-3-small'; // 1536 dimensions

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
    }),
  });
  const data = await response.json();
  return data.data[0].embedding;
}
```
- **Alternative**: Create a Supabase Edge Function that wraps the OpenAI call so the API key never touches the client.

### 4.2 — Trigger Embedding After Save
Modify the save flow from Phase 3:
1. Insert note with `embedding: null`.
2. Immediately (or in background) call `generateEmbedding(content)`.
3. Update the note row: `UPDATE notes SET embedding = $vector WHERE id = $noteId`.

### 4.3 — Edge Function Approach (Recommended)
Create a Supabase Edge Function `generate-embedding`:
- **Trigger**: Called from client after note creation, or via a Postgres trigger on INSERT.
- **Logic**:
  1. Receive `{ noteId, content }`.
  2. Call OpenAI embeddings API.
  3. Update the note's `embedding` column.
- This keeps the API key server-side.

### 4.4 — Error Handling
- If embedding generation fails, mark note with a `needs_embedding` flag or retry on next app open.
- Rate-limit awareness: batch embeddings if many notes are created quickly.

### 4.5 — Batch Re-embedding (Utility)
- Create a utility function to re-embed all notes missing embeddings:
```typescript
export async function backfillEmbeddings(userId: string) {
  const { data: notes } = await supabase
    .from('notes')
    .select('id, content')
    .eq('user_id', userId)
    .is('embedding', null);

  for (const note of notes ?? []) {
    const embedding = await generateEmbedding(note.content);
    await supabase
      .from('notes')
      .update({ embedding })
      .eq('id', note.id);
  }
}
```

## Verification
- After saving a new note, the `embedding` column is populated within a few seconds.
- Embedding dimension matches 1536.
- `match_notes` RPC returns reasonable semantic matches when tested with related content.

## Dependencies
- Phase 2 (schema with vector column), Phase 3 (note creation).

## Outputs
- Working embedding pipeline that populates vectors for all new notes.
- Optional: Supabase Edge Function for server-side embedding.
