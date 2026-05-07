import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all badges and user's earned badges
  const [ { data: allBadges }, { data: userBadges } ] = await Promise.all([
    supabase.from("badges").select("*").order('xp_reward', { ascending: true }),
    supabase.from("user_badges").select("badge_id, earned_at").eq("user_id", user.id)
  ]);

  return NextResponse.json({
    allBadges: allBadges || [],
    earnedBadges: userBadges || []
  });
}
