import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { DataManagementCard } from "@/components/data-management-card";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Fetch transactions for export
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="max-w-2xl mx-auto w-full">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Profil Pengguna</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Perbarui informasi pribadi dan pengaturan kata sandi Anda.
          </p>
        </div>
        
        <ProfileForm user={user} />
      </div>

      <div className="border-t border-border/40 pt-8 mt-8">
        <div className="max-w-2xl mx-auto w-full">
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">Manajemen Data</h2>
          <DataManagementCard transactions={transactions || []} />
        </div>
      </div>
    </div>
  );
}
