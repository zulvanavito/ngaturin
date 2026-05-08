import { createClient } from "@/lib/supabase/server";

const XP_PER_LEVEL = 100;

/**
 * Adds XP to a user's profile and handles level-ups using atomic SQL function.
 */
export async function addXp(userId: string, amount: number) {
  const supabase = await createClient();

  const { error } = await supabase.rpc('increment_gamification_xp', {
    p_user_id: userId,
    p_xp_amount: amount
  });

  if (error) {
    console.error('Error calling increment_gamification_xp RPC:', error);
  }

  // We return null/undefined because the RPC is VOID.
  // If the caller needs the new state, it should fetch it.
  return null;
}

/**
 * Updates the user's daily activity streak.
 */
export async function updateStreak(userId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: profile, error: fetchError } = await supabase
    .from('gamification_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching gamification profile:', fetchError);
    return;
  }

  if (!profile) {
    await supabase.from('gamification_profiles').insert({
      user_id: userId,
      xp: 0,
      level: 1,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today
    });
    return;
  }

  if (profile.last_activity_date === today) {
    return; // Already active today
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = 1;
  if (profile.last_activity_date === yesterdayStr) {
    newStreak = (profile.current_streak || 0) + 1;
  }

  const newLongestStreak = Math.max(newStreak, profile.longest_streak || 0);

  const { error: updateError } = await supabase
    .from('gamification_profiles')
    .update({
      current_streak: newStreak,
      longest_streak: newLongestStreak,
      last_activity_date: today,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (updateError) {
    console.error('Error updating streak:', updateError);
  }
}

/**
 * Checks if the user qualifies for any new badges.
 */
export async function checkAndAwardBadges(userId: string) {
  const supabase = await createClient();

  // 1. Get user data, transaction count, goals completed, and debts settled in parallel
  const [
    { data: profile },
    { count: txCount },
    { count: goalsCompleted },
    { count: debtsSettled },
    { data: allBadges },
    { data: userBadges }
  ] = await Promise.all([
    supabase.from('gamification_profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('goals').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_completed', true),
    supabase.from('debts').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_settled', true),
    supabase.from('badges').select('*'),
    supabase.from('user_badges').select('badge_id').eq('user_id', userId)
  ]);

  if (!profile || !allBadges) return [];

  const earnedBadgeIds = new Set(userBadges?.map(b => b.badge_id) || []);
  const newlyEarnedBadges = [];

  // 2. Check requirements
  for (const badge of allBadges) {
    if (earnedBadgeIds.has(badge.id)) continue;

    let qualified = false;
    
    switch (badge.requirement_type) {
      case 'TRANSACTION_COUNT':
        qualified = (txCount || 0) >= badge.requirement_value;
        break;
      case 'STREAK_DAYS':
        qualified = (profile.current_streak || 0) >= badge.requirement_value;
        break;
      case 'GOAL_COMPLETED':
        qualified = (goalsCompleted || 0) >= badge.requirement_value;
        break;
      case 'DEBT_SETTLED':
        qualified = (debtsSettled || 0) >= badge.requirement_value;
        break;
    }

    if (qualified) {
      newlyEarnedBadges.push(badge);
    }
  }

  // 3. Award badges in bulk
  if (newlyEarnedBadges.length > 0) {
    const { error: bulkAwardError } = await supabase
      .from('user_badges')
      .insert(newlyEarnedBadges.map(badge => ({
        user_id: userId,
        badge_id: badge.id
      })));

    if (bulkAwardError) {
      console.error('Error awarding badges in bulk:', bulkAwardError);
      return [];
    }

    // 4. Consolidated XP
    const totalXpReward = newlyEarnedBadges.reduce((sum, badge) => sum + badge.xp_reward, 0);
    await addXp(userId, totalXpReward);
  }

  return newlyEarnedBadges;
}

/**
 * Main function to record an action and update gamification state.
 */
export async function handleGamifiedAction(userId: string, actionXp: number = 10) {
  console.log(`[Gamification] Processing action for user ${userId}, XP: ${actionXp}`);
  try {
    await updateStreak(userId);
    await addXp(userId, actionXp);
    const newBadges = await checkAndAwardBadges(userId);
    
    console.log(`[Gamification] Success! New Badges Earned: ${newBadges.length}`);
    return { newBadges };
  } catch (err) {
    console.error("[Gamification] Critical error in service:", err);
    throw err;
  }
}
