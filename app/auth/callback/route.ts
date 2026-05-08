import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getSafeRedirectUrl } from "@/lib/utils/auth-helpers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextRaw = searchParams.get("next");
  const next = nextRaw ? getSafeRedirectUrl(nextRaw) : "/auth/confirm-email";

  // 1. Handle error parameters returned by Supabase
  const errorMsg = searchParams.get("error_description") || searchParams.get("error");
  if (errorMsg) {
    return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(errorMsg)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
    return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(error.message)}`);
  }

  // Check if it's a token_hash flow instead
  const tokenHash = searchParams.get("token_hash");
  if (tokenHash) {
    return NextResponse.redirect(`${origin}/auth/confirm?${searchParams.toString()}`);
  }

  // If no code or token_hash, check if user is already logged in
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/auth/error?error=Could not authenticate: No authentication code provided`);
}
