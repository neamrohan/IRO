import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ⚠️ SERVER ONLY. Uses the service-role key which bypasses Row Level Security.
// Never import this file from a Client Component or expose it to the browser.
// Only use inside Server Actions / Route Handlers, after verifying the
// caller is an authenticated admin (see lib/auth.ts requireAdmin()).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
