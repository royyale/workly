import { createClient } from "@supabase/supabase-js";

// Server-side client — uses the service role key so API routes can read/write
// across all businesses. Never expose this client or key to the browser.
export function getSupabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
