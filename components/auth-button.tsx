import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground hidden sm:inline">
        {user.email}
      </span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Link
        href="/auth/login"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Masuk
      </Link>
    </div>
  );
}
