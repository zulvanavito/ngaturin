import { getGamification, getBadges, getUserBadges, getUser } from "@/lib/dal";
import { RewardsClientView } from "./rewards-client-view";
import { redirect } from "next/navigation";

interface UserBadge {
  badge_id: string;
}

export default async function RewardsPage() {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  // Fetch all gamification data in parallel
  const [profile, badges, earnedBadges] = await Promise.all([
    getGamification(),
    getBadges(),
    getUserBadges()
  ]);

  const earnedBadgeIds = (earnedBadges as UserBadge[]).map((b) => b.badge_id);

  return (
    <RewardsClientView 
      profile={profile} 
      allBadges={badges} 
      earnedBadgeIds={earnedBadgeIds} 
    />
  );
}
