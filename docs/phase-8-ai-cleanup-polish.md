# Phase 8: AI Cleanup & Polish

## Goal
Implement the "Magic Wand" AI cleanup feature that reformats messy notes into clean outlines, and polish the entire app for release readiness.

## Prerequisites
- Phase 7 (Detail view with the "Clean Up" button).
- Phase 4 (AI helper module exists).
- OpenAI or Gemini API key configured.

## Steps

### 8.1 — LLM Cleanup Function (`lib/ai.ts`)
```typescript
const CLEANUP_MODEL = 'gpt-4o-mini'; // or 'gemini-1.5-flash'

const SYSTEM_PROMPT = `You are a note-formatting assistant. The user will give you raw, 
unstructured notes that may contain fragments, run-on sentences, and merged thoughts. 
Your job is to:
1. Organize the content into logical sections.
2. Use clear bullet points and sub-bullets.
3. Fix grammar and spelling without changing meaning.
4. Preserve ALL information — do not remove or summarize away any content.
Return only the formatted note content, no preamble.`;

export async function cleanupNote(content: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: CLEANUP_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content },
      ],
      temperature: 0.3,
    }),
  });
  const data = await response.json();
  return data.choices[0].message.content;
}
```

### 8.2 — Wire Up "Clean Up" Button (`app/note/[id].tsx`)
```typescript
const [isCleaning, setIsCleaning] = useState(false);

async function handleCleanup() {
  setIsCleaning(true);
  try {
    const cleaned = await cleanupNote(note.content);
    setContent(cleaned);
    // Save to Supabase
    await supabase
      .from('notes')
      .update({ content: cleaned, updated_at: new Date().toISOString() })
      .eq('id', noteId);
    // Regenerate embedding for updated content
    const newEmbedding = await generateEmbedding(cleaned);
    await supabase
      .from('notes')
      .update({ embedding: newEmbedding })
      .eq('id', noteId);
  } catch (error) {
    Alert.alert('Cleanup Failed', 'Please try again.');
  } finally {
    setIsCleaning(false);
  }
}
```
- Show a loading spinner/shimmer while cleaning.
- Haptic feedback on completion.

### 8.3 — Undo Cleanup
- Before applying cleanup, store the original content in local state.
- Show an "Undo" option for 10 seconds after cleanup completes.
- Tapping undo restores original content and saves back to Supabase.

### 8.4 — App-Wide Polish

#### Animations
- Page transition animations between tabs (shared element transitions where possible).
- Skeleton loaders while data is fetching.
- Smooth keyboard animations on Capture screen.

#### Error Handling
- Global error boundary component.
- Network status indicator (offline banner).
- Retry logic for failed API calls.

#### Performance
- Memoize expensive component renders.
- Use `FlatList` with proper `keyExtractor` and `getItemLayout`.
- Lazy-load screens with `React.lazy` / Suspense where appropriate.

#### Accessibility
- All interactive elements have accessibility labels.
- Support dynamic font sizes.
- Proper color contrast ratios.

### 8.5 — App Icon & Splash Screen
- Design app icon (or generate with `generate_image` tool).
- Configure splash screen in `app.json`.

### 8.6 — Final Testing Checklist
- [ ] Capture → save → note appears in Review mode.
- [ ] Swipe left → note archived, doesn't appear in Vault.
- [ ] Swipe right → note stored, appears in Vault.
- [ ] Swipe up → similar notes found, merge works correctly.
- [ ] Vault → tap note → detail view loads with content.
- [ ] Clean Up → note is reformatted, saved, and embedding updated.
- [ ] Auth flow → sign up, sign in, sign out all work.
- [ ] Offline → notes queue and sync when back online.
- [ ] Performance → 60fps animations, sub-second screen loads.

## Verification
- "Clean Up" button transforms messy text into organized bullet points.
- Original content can be undone.
- All animations are smooth and polished.
- End-to-end flow from capture → review → merge → vault → cleanup works.

## Dependencies
- All previous phases (1–7).

## Outputs
- Production-ready app with AI cleanup, polished UI, and comprehensive error handling.
