# Phase 7: Vault & Detail Screens

## Goal
Build the Vault (Library) screen for browsing stored notes, and the Detail View screen for reading and editing individual notes.

## Prerequisites
- Phase 2 (notes table with stored status).
- Phase 5 (notes being moved to `stored` status via swiping).

## Steps

### 7.1 — Vault Screen (`app/(tabs)/vault.tsx`)

#### Data Fetching
```typescript
const { data: storedNotes } = await supabase
  .from('notes')
  .select('id, content, updated_at')
  .eq('user_id', userId)
  .eq('status', 'stored')
  .order('updated_at', { ascending: false });
```
- Use real-time subscription or pull-to-refresh for updates.

#### UI Layout
- **FlatList** with card-style items.
- Each item shows:
  - First line of content as a title (bold).
  - First ~80 chars as preview text.
  - Relative timestamp ("2 hours ago").
- Search bar at the top for text-based filtering (client-side filter on `content`).
- Optional: toggle between list view and grid view.

#### Empty State
- "No stored notes yet. Start capturing and reviewing!" with a link to Capture.

### 7.2 — Detail View (`app/note/[id].tsx`)

#### Data Fetching
```typescript
const { id } = useLocalSearchParams();
const { data: note } = await supabase
  .from('notes')
  .select('*')
  .eq('id', id)
  .single();
```

#### UI Layout
- Full-screen multiline `TextInput` (editable) showing note content.
- Top bar with back button and note metadata (last updated).
- Floating "Clean Up ✨" button (Magic Wand) — action handled in Phase 8.
- Auto-save: debounce content changes (e.g., 1.5s delay) and update Supabase.

#### Auto-Save Logic
```typescript
const debouncedSave = useMemo(
  () => debounce(async (content: string) => {
    await supabase
      .from('notes')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', noteId);
  }, 1500),
  [noteId]
);
```

### 7.3 — Navigation
- Tapping a vault item navigates to `/note/[id]`.
- Back button returns to vault.
- Tab bar at bottom: Capture | Review | Vault.

### 7.4 — Delete from Vault
- Swipe-to-delete on vault list items (or long-press context menu).
- Confirmation dialog before archiving.

### 7.5 — Styling
- Cards with subtle shadows / rounded corners.
- Consistent dark mode support.
- Smooth list animations (layout animation on item removal).

## Verification
- Vault shows all notes with `status = 'stored'`, ordered by most recently updated.
- Tapping a note opens the detail view with full content.
- Editing content auto-saves to Supabase after debounce.
- Search bar filters notes correctly.
- Delete/archive works from vault.
- Navigation between tabs is seamless.

## Dependencies
- Phase 1 (routing), Phase 2 (notes table).

## Outputs
- Vault list screen and Detail view with auto-save editing.
