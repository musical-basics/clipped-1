# Phase 1: Project Setup & Expo Scaffolding

## Goal
Bootstrap the React Native + Expo project with TypeScript strict mode, install all core dependencies, and establish the folder structure and developer tooling.

## Prerequisites
- Node.js ≥ 18, pnpm
- Expo CLI (`npx expo`)
- Git repo already initialized

## Steps

### 1.1 — Initialize Expo Project
```bash
npx -y create-expo-app@latest ./ --template blank-typescript
```
- Confirm `tsconfig.json` has `"strict": true`.

### 1.2 — Install Core Dependencies
```bash
pnpm add react-native-reanimated react-native-gesture-handler
pnpm add expo-router react-native-screens react-native-safe-area-context
pnpm add @supabase/supabase-js
pnpm add nativewind tailwindcss
pnpm add -D @types/react @types/react-native eslint prettier
```

### 1.3 — Configure NativeWind / Tailwind
- Create `tailwind.config.js` with content paths pointing to `app/**/*.{ts,tsx}`.
- Add the NativeWind babel plugin to `babel.config.js`.

### 1.4 — Folder Structure
```
app/
  (tabs)/
    index.tsx        # Capture screen
    review.tsx       # Review / Triage screen
    vault.tsx        # Vault / Library screen
  note/
    [id].tsx         # Detail view
lib/
  supabase.ts        # Supabase client singleton
  ai.ts              # Embedding + LLM helper functions
  types.ts           # TypeScript interfaces (Note, MergeEvent, User)
components/
  SwipeCard.tsx
  NoteCard.tsx
  MergeSheet.tsx
  CleanupButton.tsx
```

### 1.5 — Environment Variables
Create `.env.local` with placeholders:
```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_OPENAI_API_KEY=
```
Add `.env.local` to `.gitignore`.

### 1.6 — Linting & Formatting
- Configure ESLint with `@typescript-eslint` plugin.
- Add Prettier config (`.prettierrc`).
- Add scripts to `package.json`: `"lint"`, `"format"`.

## Verification
- `pnpm dev` starts the Expo dev server without errors.
- Folder structure matches the plan above.
- TypeScript compiles with zero errors in strict mode.

## Dependencies
- None (this is the first phase).

## Outputs
- Working Expo project shell with routing stubs and all dependencies installed.
