import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfilePageClient } from "@/components/profile/profile-page-client";

export const metadata = {
  title: "Profil & Langganan | Ngaturin",
  description: "Kelola profil, keamanan, langganan, dan data akun Anda.",
};

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

  // Get all subscriptions for history
  const { data: subscriptionHistory } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Get current active subscription (latest)
  const subscription = subscriptionHistory?.[0] || null;

  return (
    <ProfilePageClient
      user={JSON.parse(JSON.stringify(user))}
      transactions={transactions || []}
      subscription={subscription}
      subscriptionHistory={subscriptionHistory || []}
    />
  );
}
