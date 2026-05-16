import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

/**
 * Data Access Layer (DAL) for Server Components.
 * Functions are wrapped in React.cache() to deduplicate requests within a single render pass.
 */

export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

export const getUserProfile = cache(async () => {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("DAL: Error fetching user profile:", error);
    return null;
  }

  return data;
});

export const getWallets = cache(async () => {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return [];

  const { data: wallets, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("DAL: Error fetching wallets:", error);
    return [];
  }

  // Fetch ALL transactions to calculate per-wallet balance
  // Optimization: In a real large app, you'd store balance on the wallet table and update via triggers.
  const { data: txs } = await supabase
    .from("transactions")
    .select("wallet_id, type, amount, description")
    .eq("user_id", user.id);

  const balanceMap: Record<string, number> = {};
  for (const tx of txs ?? []) {
    if (!tx.wallet_id) continue;
    if (!balanceMap[tx.wallet_id]) balanceMap[tx.wallet_id] = 0;

    if (tx.type === "income") {
      balanceMap[tx.wallet_id] += Number(tx.amount);
    } else if (tx.type === "expense") {
      balanceMap[tx.wallet_id] -= Number(tx.amount);
    } else if (tx.type === "transfer") {
      if (tx.description?.endsWith("→ masuk")) {
        balanceMap[tx.wallet_id] += Number(tx.amount);
      } else if (tx.description?.endsWith("→ keluar")) {
        balanceMap[tx.wallet_id] -= Number(tx.amount);
      }
    }
  }

  return (wallets ?? []).map((w) => ({
    ...w,
    balance: balanceMap[w.id] ?? 0,
  }));
});

export const getTransactions = cache(async (filters: { 
  category?: string; 
  type?: string; 
  keyword?: string; 
  month?: string; 
  walletId?: string;
} = {}) => {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return [];

  let query = supabase
    .from("transactions")
    .select("*, wallets(name), debt_id")
    .eq("user_id", user.id);

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.keyword) query = query.ilike("description", `%${filters.keyword}%`);
  
  if (filters.month) {
    const startDate = `${filters.month}-01`;
    const [yearStr, monthStr] = filters.month.split('-');
    const nextMonth = new Date(Number(yearStr), Number(monthStr), 1);
    const endDate = new Date(nextMonth.getTime() - 1).toISOString().split('T')[0];
    query = query.gte("date", startDate).lte("date", endDate);
  }

  if (filters.walletId) query = query.eq("wallet_id", filters.walletId);

  const { data, error } = await query
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("DAL: Error fetching transactions:", error);
    return [];
  }

  return data || [];
});

export const getCategories = cache(async () => {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) {
    console.error("DAL: Error fetching categories:", error);
    return [];
  }

  return data || [];
});

export const getDebts = cache(async () => {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", user.id)
    .order("due_date", { ascending: true });

  if (error) {
    console.error("DAL: Error fetching debts:", error);
    return [];
  }

  return data || [];
});

export const getRecurringBills = cache(async () => {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("recurring_bills")
    .select("*")
    .eq("user_id", user.id)
    .order("due_day", { ascending: true });

  if (error) {
    console.error("DAL: Error fetching recurring bills:", error);
    return [];
  }

  return data || [];
});

export const getBudgets = cache(async (month?: string) => {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return [];

  const currentMonth = new Date().toISOString().substring(0, 7);
  const targetMonth = month || currentMonth;

  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .eq("month", targetMonth)
    .order("category", { ascending: true });

  if (error) {
    console.error("DAL: Error fetching budgets:", error);
    return [];
  }

  return data || [];
});

export const getGoals = cache(async () => {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("DAL: Error fetching goals:", error);
    return [];
  }

  return data || [];
});

export const getGamification = cache(async () => {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("gamification_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return { xp: 0, level: 1, current_streak: 0 };
    }
    console.error("DAL: Error fetching gamification:", error);
    return null;
  }

  return data;
});

export const getInvestments = cache(async () => {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("investments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("DAL: Error fetching investments:", error);
    return [];
  }

  return data || [];
});

export const getInvestmentHistory = cache(async () => {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("investment_history")
    .select("date, value, invested")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  if (error) {
    console.error("DAL: Error fetching investment history:", error);
    return [];
  }

  return data || [];
});

export const getBadges = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("badges")
    .select("*")
    .order("xp_reward", { ascending: true });

  if (error) {
    console.error("DAL: Error fetching badges:", error);
    return [];
  }

  return data || [];
});

export const getUserBadges = cache(async () => {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_badges")
    .select("badge_id, earned_at")
    .eq("user_id", user.id);

  if (error) {
    console.error("DAL: Error fetching user badges:", error);
    return [];
  }

  return data || [];
});

export const getSubscriptionHistory = cache(async () => {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("DAL: Error fetching subscription history:", error);
    return [];
  }

  return data || [];
});

export const getSubscription = cache(async () => {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "settlement")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
});
