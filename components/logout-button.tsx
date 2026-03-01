"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Button
      onClick={logout}
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-foreground gap-2"
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">Keluar</span>
    </Button>
  );
}
