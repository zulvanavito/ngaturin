import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/auth/confirm-email";
  // Protect against open redirect: ensure it's a relative path starting with '/' but not '//'
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/auth/confirm-email";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      const isSignup = type === "signup";
      const redirectUrl = isSignup ? "/auth/confirm-email" : safeNext;
      return redirect(redirectUrl);
    } else {
      return redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
    }
  }

  return redirect(`/auth/error?error=${encodeURIComponent("No token hash or type provided")}`);
}
