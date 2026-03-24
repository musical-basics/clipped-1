# Supabase Auth Setup Guide

Every time you set up Supabase auth in a new project, follow this checklist to avoid the common pitfalls.

---

## 1. Get the Right API Keys

Go to **Supabase Dashboard → Settings → API**.

| Key | Starts with | Use for |
|-----|-------------|---------|
| `anon` (public) | `eyJhbGci...` | Client-side reads, RLS-protected queries |
| `service_role` | `eyJhbGci...` | Server-side admin operations (bypasses RLS) |

> [!CAUTION]
> The **database password** (Settings → Database) starts with `sb_secret_...` — this is NOT an API key. Using it as one will give you **401 Unauthorized** on every request.

### `.env.local` example (Expo)
```env
EXPO_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your_service_role_key
```

> [!WARNING]
> After creating/editing `.env.local`, you must **restart the dev server** (`pnpm dev`) for env vars to load. Expo caches env vars at bundle time.

---

## 2. Expose Custom Schemas

If you're using a custom schema (not `public`), e.g. `clipped1`:

1. **Dashboard → Settings → API → Exposed schemas** → add your schema name
2. Without this you get: `PGRST106: Only the following schemas are exposed: public, graphql_public, ...`

---

## 3. Grant Schema Permissions

Even after exposing the schema, the `authenticated` and `anon` roles need explicit grants. Run this SQL in **Dashboard → SQL Editor**:

```sql
-- Replace 'your_schema' with your schema name
GRANT USAGE ON SCHEMA your_schema TO authenticated;
GRANT USAGE ON SCHEMA your_schema TO anon;

GRANT ALL ON ALL TABLES IN SCHEMA your_schema TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA your_schema TO anon;

-- Auto-grant for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA your_schema GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA your_schema GRANT ALL ON TABLES TO anon;
```

Without this you get: `42501: permission denied for schema your_schema` (403 Forbidden)

---

## 4. Configure Auth URLs

Go to **Dashboard → Authentication → URL Configuration**:

- **Site URL**: `http://localhost:8081` (or whatever port your dev server runs on)
- **Redirect URLs**: add `http://localhost:8081`

This is needed for OAuth redirects and email confirmation links.

---

## 5. Email Validation Gotchas

- Supabase may reject obviously fake emails like `test@test.com` during `signUp()`
- Use a real email or create users manually via **Dashboard → Authentication → Users → Add User** (check "Auto Confirm User")
- If you hit `429 Too Many Requests` / `email rate limit exceeded`, wait a few minutes or create the user manually in the dashboard

---

## 6. Admin vs Client API Calls

| Method | Works from browser? | Requires |
|--------|-------------------|----------|
| `supabase.auth.signUp()` | ✅ Yes | anon or service_role key |
| `supabase.auth.signInWithPassword()` | ✅ Yes | anon or service_role key |
| `supabase.auth.admin.createUser()` | ❌ No (401) | service_role key + server-side only |

> [!IMPORTANT]
> `admin.*` methods are **server-only**. They return 401 when called from the browser even with a valid service role key. Use `signUp()` instead for client-side user creation, or create an API route.

---

## Quick Debugging

| Error | Cause | Fix |
|-------|-------|-----|
| **401** on all endpoints | Wrong API key (likely using `sb_secret_` database password) | Use JWT key from Settings → API |
| **400** on signUp | Invalid email or signups disabled | Use real email or enable signups |
| **403 / 42501** | Schema permissions not granted | Run GRANT SQL above |
| **406 / PGRST106** | Schema not exposed | Add schema in Settings → API |
| **429** | Rate limit exceeded | Wait or create user manually in dashboard |
| Env vars empty | `.env.local` not loaded | Restart dev server |
