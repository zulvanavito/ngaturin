import { createServerClient } from "@supabase/ssr";

export async function test() {
    const supabase = createServerClient("url", "key", { cookies: { getAll: () => [], setAll: () => {} } });
    console.log("getClaims exists:", typeof supabase.auth.getClaims === 'function');
}
