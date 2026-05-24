import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (!client) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
    }
    client = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
  }
  return client;
}
