# Phase 3: Capture Screen

## Goal
Build the primary Capture screen — the first thing users see when opening the app. It must be extremely fast to load and focus on frictionless text input.

## Prerequisites
- Phase 1 (Expo project + routing).
- Phase 2 (Supabase client configured).

## Steps

### 3.1 — Screen Layout (`app/(tabs)/index.tsx`)
- Full-screen view with a large, multiline `TextInput`.
- `autoFocus: true` so the keyboard opens immediately.
- Minimalist header showing app name / logo.
- Floating "Save" button at the bottom-right (or a large bottom bar button).
- Optional: character count indicator.

### 3.2 — Save Logic
On pressing "Save":
1. Validate content is not empty / whitespace-only.
2. Show a brief saving indicator (spinner or haptic feedback).
3. Call `saveNote(content)` which:
   - Inserts a row into `notes` with `status: 'inbox'` and `embedding: null` (embedding generated async — see Phase 4).
   - Returns the new note ID.
4. Clear the `TextInput`.
5. Show subtle success animation (checkmark fade-in or toast).

### 3.3 — Offline Support (Nice-to-have for MVP)
- Queue notes locally when offline using `AsyncStorage`.
- Sync queue on next network availability.

### 3.4 — Styling
- Dark mode friendly (dark background, light text).
- Large font for input (≥ 18px).
- Smooth keyboard-avoid behavior using `KeyboardAvoidingView`.
- Use `react-native-safe-area-context` for notch-safe padding.

### 3.5 — Haptic Feedback
- Light haptic on save (`expo-haptics`).
- Error haptic on empty save attempt.

## Verification
- App launches directly to the Capture screen with keyboard visible.
- Typing and saving a note inserts a row into `notes` table with `status = 'inbox'`.
- Input clears after save.
- Empty submissions are rejected gracefully.

## Dependencies
- Phase 1 (project shell), Phase 2 (Supabase + schema).

## Outputs
- Working Capture screen that writes inbox notes to Supabase.
