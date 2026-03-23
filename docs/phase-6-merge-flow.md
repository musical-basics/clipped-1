# Phase 6: Merge Flow & Vector Search

## Goal
Implement the "Swipe Up" merge flow: find semantically similar stored notes using vector search, present them in a bottom sheet, and merge on user selection.

## Prerequisites
- Phase 2 (`match_notes` RPC created).
- Phase 4 (embeddings populated on notes).
- Phase 5 (swipe-up gesture triggers this flow).

## Steps

### 6.1 — MergeSheet Component (`components/MergeSheet.tsx`)
- Use `@gorhom/bottom-sheet` or a custom animated bottom sheet.
- Props: `currentNote: Note`, `onMerge(parentId: string): void`, `onClose(): void`.
- Slides up from the bottom with a drag handle.

### 6.2 — Vector Search Call
When `handleSwipeUp(note)` is triggered:
```typescript
async function findSimilarNotes(note: Note) {
  const { data, error } = await supabase.rpc('match_notes', {
    query_embedding: note.embedding,
    match_threshold: 0.5,
    match_count: 3,
    current_user_id: userId,
  });
  return data; // Array of { id, content, similarity }
}
```

### 6.3 — Display Similar Notes
- Show top 3 results in the bottom sheet as tappable cards.
- Each card shows:
  - First ~100 chars of the note content (preview).
  - Similarity score as a percentage badge.
- If 0 results, show "No similar notes found" with option to store the note instead.

### 6.4 — Execute Merge
When user taps a matching note:
```typescript
async function mergeNotes(parentId: string, childNote: Note) {
  // 1. Fetch parent note content
  const { data: parent } = await supabase
    .from('notes')
    .select('content')
    .eq('id', parentId)
    .single();

  // 2. Append child content to parent
  const mergedContent = `${parent.content}\n\n---\n\n${childNote.content}`;
  await supabase
    .from('notes')
    .update({ content: mergedContent, updated_at: new Date().toISOString() })
    .eq('id', parentId);

  // 3. Archive the child note
  await supabase
    .from('notes')
    .update({ status: 'archived' })
    .eq('id', childNote.id);

  // 4. Log merge event
  await supabase.from('merge_events').insert({
    parent_note_id: parentId,
    child_note_id: childNote.id,
  });

  // 5. Re-generate embedding for the merged parent
  const newEmbedding = await generateEmbedding(mergedContent);
  await supabase
    .from('notes')
    .update({ embedding: newEmbedding })
    .eq('id', parentId);
}
```

### 6.5 — Post-Merge UX
- Close bottom sheet.
- Show brief success animation / haptic.
- Advance to next card in review mode.

### 6.6 — Edge Cases
- Note has no embedding yet → Generate on-the-fly before calling RPC.
- Network failure during merge → Show retry dialog, don't advance card.
- User dismisses bottom sheet → Card returns to center, no action taken.

## Verification
- Swiping up opens the bottom sheet with semantically similar notes.
- Tapping a similar note correctly appends content to the parent.
- Child note status changes to `archived`.
- `merge_events` table has a new row.
- Parent note's embedding is regenerated.
- Edge cases handled gracefully.

## Dependencies
- Phase 2, 4, 5.

## Outputs
- Complete merge flow from swipe-up gesture through vector search to note consolidation.
