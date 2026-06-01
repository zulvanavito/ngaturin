import { createClient } from "@supabase/supabase-js";

/**
 * Creates a public, static Supabase client for unauthenticated read-only operations.
 * Use this for blog posts and other public content during static generation (prerendering)
 * to avoid context/cookie-related build errors.
 */
export function createPublicStaticClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase public environment variables for static client.");
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
