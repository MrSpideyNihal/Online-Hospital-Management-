import { createBrowserClient } from '@supabase/ssr'

// Use globalThis so the singleton survives HMR and code-splitting boundaries.
// A module-level `let` gets wiped on hot-reload, creating duplicate GoTrueClients
// that fight over the same navigator lock → 5 s stall.
const globalForSupabase = globalThis as unknown as {
  __supabaseClient: ReturnType<typeof createBrowserClient> | undefined
}

export function createClient() {
  if (globalForSupabase.__supabaseClient) return globalForSupabase.__supabaseClient
  globalForSupabase.__supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return globalForSupabase.__supabaseClient
}
