# Phase 5: Review Mode & Swipe Gestures

## Goal
Build the Tinder-style card review interface where users triage their inbox notes by swiping left (delete), right (keep), or up (merge).

## Prerequisites
- Phase 1 (gesture handler + reanimated installed).
- Phase 2 (notes table).
- Phase 3 & 4 (notes with embeddings exist in the database).

## Steps

### 5.1 — Fetch Inbox Notes
In `app/(tabs)/review.tsx`:
```typescript
const { data: inboxNotes } = await supabase
  .from('notes')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'inbox')
  .order('created_at', { ascending: true });
```
- Load all inbox notes into state.
- Track current card index.

### 5.2 — SwipeCard Component (`components/SwipeCard.tsx`)
- Uses `react-native-gesture-handler` `PanGestureHandler`.
- Uses `react-native-reanimated` `useSharedValue`, `useAnimatedStyle`, `withSpring`.
- Card follows finger position with rotation effect.
- Visual indicators during drag:
  - **Left drag** → Red overlay with "DELETE" text fades in.
  - **Right drag** → Green overlay with "KEEP" text fades in.
  - **Up drag** → Blue overlay with "MERGE" text fades in.
- Thresholds:
  - Horizontal: translate X > 120px triggers action.
  - Vertical: translate Y < -150px triggers merge.

### 5.3 — Swipe Actions
```typescript
// Swipe Left → Archive
async function handleSwipeLeft(noteId: string) {
  await supabase.from('notes').update({ status: 'archived' }).eq('id', noteId);
  advanceToNextCard();
}

// Swipe Right → Store
async function handleSwipeRight(noteId: string) {
  await supabase.from('notes').update({ status: 'stored' }).eq('id', noteId);
  advanceToNextCard();
}

// Swipe Up → Trigger merge flow (Phase 6)
function handleSwipeUp(note: Note) {
  openMergeSheet(note);
}
```

### 5.4 — Card Stack Effect
- Show 2-3 cards stacked behind the active card (scaled down, offset).
- When active card is swiped away, next card animates into focus position.

### 5.5 — Empty State
- When no inbox notes remain, show a congratulatory "All caught up! 🎉" screen.
- Link back to Capture screen.

### 5.6 — Undo (Nice-to-have)
- After each swipe, show a brief "Undo" toast (3 seconds).
- Tapping undo reverts the last status change.

## Verification
- Inbox notes appear as swipeable cards.
- Swiping left updates status to `archived`.
- Swiping right updates status to `stored`.
- Swiping up triggers merge flow (Phase 6).
- Animations are smooth at 60fps.
- Empty state shows when inbox is cleared.

## Dependencies
- Phase 1, 2, 3.

## Outputs
- Fully interactive swipe-based review screen with animated card stack.
