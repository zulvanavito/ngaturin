"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Wallet, Bell, Tag, User, LogOut, Sun, Moon, HandCoins, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";

export function MobileMenuButton() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({
          name: user.user_metadata?.full_name || user.email || "",
          email: user.email || "",
          avatar: user.user_metadata?.avatar_url,
        });
      }
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="sm:hidden flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* User Info */}
          {user && (
            <>
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-muted border border-border/50 flex items-center justify-center shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      {user.name?.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Navigation Links */}
          <DropdownMenuItem asChild>
            <Link href="/dashboard/wallets" className="flex items-center gap-2 cursor-pointer w-full">
              <Wallet className="w-4 h-4" />
              Dompet
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/bills" className="flex items-center gap-2 cursor-pointer w-full">
              <Bell className="w-4 h-4" />
              Tagihan
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/categories" className="flex items-center gap-2 cursor-pointer w-full">
              <Tag className="w-4 h-4" />
              Kategori
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/debts" className="flex items-center gap-2 cursor-pointer w-full">
              <HandCoins className="w-4 h-4" />
              Utang/Piutang
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/investments" className="flex items-center gap-2 cursor-pointer w-full text-secondary dark:text-primary">
              <TrendingUp className="w-4 h-4" />
              Investasi
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Profile */}
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile" className="flex items-center gap-2 cursor-pointer w-full">
              <User className="w-4 h-4" />
              Profil
            </Link>
          </DropdownMenuItem>

          {/* Theme Toggle */}
          <DropdownMenuItem
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-2 cursor-pointer"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === "dark" ? "Mode Terang" : "Mode Gelap"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Logout */}
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
