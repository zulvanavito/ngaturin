import { redirect } from "next/navigation";
import { ProfilePageClient } from "@/components/profile/profile-page-client";
import { getUser, getTransactions, getSubscriptionHistory, getUserProfile, getWallets, getSubscription } from "@/lib/dal";

export const metadata = {
  title: "Profil & Langganan | Ngaturin",
  description: "Kelola profil, keamanan, langganan, dan data akun Anda.",
};

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Fetch data in parallel using DAL
  const [transactions, subscriptionHistory, userProfile, wallets, activeSubscription] = await Promise.all([
    getTransactions(),
    getSubscriptionHistory(),
    getUserProfile(),
    getWallets(),
    getSubscription()
  ]);

  return (
    <ProfilePageClient
      user={JSON.parse(JSON.stringify(user))}
      userProfile={userProfile}
      wallets={wallets}
      transactions={transactions || []}
      subscription={activeSubscription}
      subscriptionHistory={subscriptionHistory || []}
    />
  );
}
