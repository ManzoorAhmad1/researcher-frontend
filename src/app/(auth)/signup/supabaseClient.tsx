import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://shyulpexykcgruhbjihk.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoeXVscGV4eWtjZ3J1aGJqaWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjExMjE0NDcsImV4cCI6MjAzNjY5NzQ0N30.cw4xtAzFpnYOuUtlPAuybfCz1o3UKg-AoZxHkMuH2HI";

const frontendSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const frontendSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = createClient(
  frontendSupabaseUrl || supabaseUrl,
  frontendSupabaseKey || supabaseKey
);
