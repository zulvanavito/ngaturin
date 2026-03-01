import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url;
    const fullName = user.user_metadata?.full_name;
    const displayName = fullName || user.email;

    return (
      <div className="flex items-center gap-3">
        <Link 
          href="/dashboard/profile" 
          className="flex items-center gap-2 hover:bg-muted/50 p-1.5 rounded-full transition-colors"
          title="Ke Profil Anda"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-muted border border-border/50 flex items-center justify-center shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-muted-foreground uppercase">
                {displayName?.charAt(0)}
              </span>
            )}
          </div>
          <span className="text-sm font-medium hidden sm:inline truncate max-w-[120px]">
            {displayName}
          </span>
        </Link>
        <LogoutButton />
      </div>
    );
  }

  return (
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
