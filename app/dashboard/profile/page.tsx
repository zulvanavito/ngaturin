import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Kembali ke Dashboard
      </Link>
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil Pengguna</h1>
        <p className="text-muted-foreground mt-2">
          Perbarui informasi pribadi dan pengaturan kata sandi Anda.
        </p>
      </div>
      
      <ProfileForm user={user} />
    </div>
  );
}
