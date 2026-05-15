# Project Scan Report — Online-Hospital-Management

## Summary
- Repo: Online-Hospital-Management (Next.js + Supabase)
- Scope: static code scan (no code changes). Report covers DB schema (supabase/*.sql), RLS, app structure, dependencies, OAuth flow, env keys, and notable TODOs / console logs / hardcoded values.

## Database & Supabase (supabase/)
- SQL files inspected: `schema.sql`, `production-hardening.sql`, `nuclear-reset-rls.sql`, `schema_v2_documents.sql`.
- Major tables (high level): `hospitals`, `hospital_services`, `profiles`, `patients`, `doctors`, `appointments`, `visits`, `dental_charts`, `treatments`, `prescriptions`, `invoices`, `notifications`, `testimonials`, `discharge_charts` (v2).
- Important helper functions/triggers:
  - `public.get_my_role()`, `public.get_my_hospital_id()` — SECURITY DEFINER helpers used by RLS.
  - `handle_new_user()` trigger — auto-creates `profiles` on auth user create.
  - `generate_patient_id()`, `generate_invoice_number()` and race-safe `assign_*` triggers using `pg_advisory_xact_lock` (prevents double assignment / race conditions).
  - `prevent_doctor_double_booking()` + trigger (uses advisory locks) in production-hardening.
- RLS and policies: RLS enabled for core tables with policies scoped by hospital_id and role (hospital_admin, doctor, receptionist, patient, super_admin). production-hardening.sql tightens WITH CHECK constraints and adds operational guards.
- Indexes & hardening: conditional/partial indexes for appointments (slot/status), other performance indexes and DO $$ blocks in the hardening script.

## Storage / Buckets
- No application-level bucket CREATE statements or `.storage.from('...')` literal calls were found in `src/`. The compiled vendor chunks contain storage API examples (library docs) with example names like `avatars` or `embeddings-*` but those are from dependencies, not app config.
- Conclusion: bucket creation/management likely done in Supabase console or via runtime env/config outside `src/`.

## Project Structure (high level)
- Root: package.json, next.config.ts, tsconfig.json, README.md
- `src/app/` — Next.js App Router pages and route handlers. Key areas:
  - `auth/` callback route: `src/app/auth/callback/route.ts` (OAuth code exchange + profile/hospital creation and redirects)
  - `admin/` — admin pages (analytics, hospitals, notifications, subscriptions)
  - `dashboard/` — authenticated dashboard with appointments, billing, patients, reports, settings etc.
  - `patient/` — patient portal, appointments, history
  - `hospitals/[slug]/` — public hospital pages and about
  - `api/` — server route handlers (admin/hospitals, build-id, debug chunk-error, etc.)
- `src/components/` — UI primitives (button, card, input, table, etc.) and `providers.tsx`.
- `src/lib/` — utilities and supabase helpers:
  - `src/lib/supabase/client.ts` — browser client creation (uses NEXT_PUBLIC_* env keys)
  - `src/lib/supabase/admin.ts` — service-role admin client (uses SUPABASE_SERVICE_ROLE_KEY)
  - `src/lib/supabase/server.ts` and many hooks in `src/lib/supabase/hooks.ts`

## Dependencies (from package.json)
- Key runtime dependencies:
  - `next` ^15.5.12
  - `react` 19.2.3
  - `@supabase/supabase-js` ^2.98.0
  - `@supabase/ssr` ^0.9.0
  - `@tanstack/react-query` ^5.90.21
  - `tailwindcss` ^4.1.0
  - Other UI / utility libs present in package.json (see file for full list).

## Google OAuth & Post-login behavior
- Login UI: `src/app/login/page.tsx` calls `supabase.auth.signInWithOAuth({ provider: 'google' })`.
- Callback handler: `src/app/auth/callback/route.ts` (server-side) — flow summary:
  1. Exchanges `code` for Supabase session via `supabase.auth.exchangeCodeForSession(code)`.
  2. Retrieves `user` via `supabase.auth.getUser()`.
  3. Optionally creates an admin service-role client if `SUPABASE_SERVICE_ROLE_KEY` is set (bypasses RLS for administrative actions).
  4. If first-time login: upserts `profiles` record; if registration type `hospital`, creates `hospitals` record with `status='pending'` and `subscription_plan='trial'`.
  5. Notifies super-admins (if admin client exists) by inserting into `notifications`.
  6. Role resolution: environment variable `NEXT_PUBLIC_SUPER_ADMIN_EMAIL` or `SUPER_ADMIN_EMAIL` can designate a super admin; otherwise uses DB `profiles.role`.
  7. Redirects users based on role: `super_admin -> /admin`, `hospital_admin|doctor|receptionist -> /dashboard`, `patient -> /patient` or public hospitals pages.

## Pages / Routes (one-line highlights)
- `/` (src/app/page.tsx): public hospital search / landing.
- `/login` (src/app/login/page.tsx): sign-in (Google OAuth).
- `/auth/callback` (src/app/auth/callback/route.ts): OAuth callback handling (server route).
- `/admin/*` (src/app/admin): admin panel (hospitals, analytics, subscriptions, notifications).
- `/dashboard/*` (src/app/dashboard): hospital dashboard (appointments, billing, patients, reports, settings).
- `/patient/*` (src/app/patient): patient portal (appointments, history).
- `/hospitals/[slug]` (src/app/hospitals/[slug]): public hospital profile pages.
- API routes: `/api/admin/hospitals` (admin hospital CRUD), `/api/debug/chunk-error` (debug utilities), various `src/app/api/...` handlers.

## Environment variables (references found in code)
- Public / client-facing keys:
  - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (used in client & server helpers)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (client)
  - `NEXT_PUBLIC_APP_URL` — canonical app URL used for OAuth redirect fallback
  - `NEXT_PUBLIC_BUILD_ID` — stamped build id used by middleware
  - `NEXT_PUBLIC_SUPER_ADMIN_EMAIL` — optional super-admin email
- Server / secret keys:
  - `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (used by `createAdminClient()`)
  - `SUPER_ADMIN_EMAIL` — alternative env name for super-admin email

Note: env keys appear across `src/lib/supabase/*`, `src/app/auth/callback/route.ts`, `src/middleware.ts`, and other server-side helpers.

## TODOs, console logs, and hardcoded values found
- TODOs: There are TODO comments inside build artifacts and dependencies; no developer TODO comments were found in main `src/` app code paths during scan. (Most `TODO` hits are from compiled / dependency code in `.next/` and node_modules.)
- Console logging in `src/` (non-dependency):
  - `src/app/auth/callback/route.ts` — multiple `console.error(...)` calls for error cases (code exchange, no user, hospital creation failures, profile upsert failures, unexpected errors).
  - Error boundary logging: `src/app/error.tsx`, `src/app/patient/error.tsx`, `src/app/dashboard/error.tsx`, `src/app/admin/error.tsx` (each logs with `console.error('[... Error Boundary]', error)`).
  - API routes: `src/app/api/debug/chunk-error/route.ts` and `src/app/api/admin/hospitals/route.ts` use `console.error` for server errors.
  - `src/app/layout.tsx` contains a `console.warn` around buildId mismatch (stale-shell detection).
- Hardcoded values & literals of note:
  - supabase/nuclear-reset-rls.sql: explicitly updates profile email `nihalrodge01@gmail.com` to `super_admin` (line: `WHERE email = 'nihalrodge01@gmail.com';`).
  - `src/app/auth/callback/route.ts` uses a fallback base URL `'https://dentizhub.netlify.app'` when `NEXT_PUBLIC_APP_URL` is not set.
  - `buildHospitalSlug()` reserves slug names: `admin, dashboard, patient, login, auth, api, hospitals` (hardcoded set in callback route).
  - Default display names: `'Dental Clinic'`, `'My Hospital'` used as fallbacks when creating hospitals.

## Notes & Recommendations
- Storage buckets: add explicit bucket names/config via env or central config if you want programmatic bucket access traceable in code. Currently no `.storage.from('...')` usage found in `src/`.
- Super-admin assignment: `nuclear-reset-rls.sql` contains a hardcoded email which appears sensitive — ensure this matches intended administration policy or parameterize it.
- Console logging: server-side `console.error` calls are expected for error handling during OAuth; consider centralized logging (Sentry/Datadog) for production.

---
Report generated by automated static scan of repository files (no code modifications performed).
