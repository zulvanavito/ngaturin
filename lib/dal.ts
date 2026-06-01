import { createClient, createStaticClient } from "@/lib/supabase/server";
import { createPublicStaticClient } from "@/lib/supabase/static";
import { cache } from "react";
import { BlogPost, BlogPostMetadata } from "@/types/blog";

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
    .eq("user_id", user.id)
    .maybeSingle();

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

  return wallets ?? [];
});

export const getTransactions = cache(async (filters: { 
  category?: string; 
  type?: string; 
  keyword?: string; 
  month?: string; 
  walletId?: string;
  limit?: number;
  offset?: number;
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

  // Sorting
  query = query
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  // Apply range only if limit is provided to avoid breaking reports
  if (filters.limit !== undefined) {
    const offset = filters.offset ?? 0;
    query = query.range(offset, offset + filters.limit - 1);
  }

  const { data, error } = await query;

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

  let query = supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .order("category", { ascending: true });

  if (month !== "all") {
    const targetMonth = month || new Date().toISOString().substring(0, 7);
    query = query.eq("month", targetMonth);
  }

  const { data, error } = await query;

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
    .select("recorded_date, current_value, total_invested")
    .eq("user_id", user.id)
    .order("recorded_date", { ascending: true });

  if (error) {
    console.error("DAL: Error fetching investment history:", error);
    return [];
  }

  return (data || []).map(row => ({
    date: row.recorded_date,
    value: Number(row.current_value),
    invested: Number(row.total_invested)
  }));
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
    // Ensure current_period_end is >= now. Column should be 'timestamptz' for absolute consistency.
    .gte("current_period_end", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
});

export const getBlogPosts = cache(async (): Promise<BlogPostMetadata[]> => {
  const supabase = createPublicStaticClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, category, tags, cover_image_url, published_at, status, is_featured, author_id, created_at, updated_at, view_count, blog_authors(name, avatar_url, bio)")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("DAL: Error fetching blog posts:", error);
    return [];
  }

  return (data || []).map(post => {
    const wordCount = (post.excerpt || "").split(/\s+/).filter(Boolean).length;
    const authorData = Array.isArray(post.blog_authors) ? post.blog_authors[0] : post.blog_authors;
    return {
      ...post,
      blog_authors: authorData,
      // Heuristic: estimate total words by assuming excerpt is roughly 20% of the content
      reading_time: Math.ceil((wordCount * 5) / 200) || 1
    };
  });
});

export const getBlogPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const supabase = createPublicStaticClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, blog_authors(name, avatar_url, bio)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("DAL: Error fetching post by slug:", error);
    return null;
  }

  if (data) {
    const wordCount = (data.content || "").split(/\s+/).filter(Boolean).length;
    data.reading_time = Math.ceil(wordCount / 200) || 1;
    data.blog_authors = Array.isArray(data.blog_authors) ? data.blog_authors[0] : data.blog_authors;
  }

  return data;
});

export const getPopularBlogPosts = cache(async (limit = 5): Promise<BlogPostMetadata[]> => {
  const supabase = createPublicStaticClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, category, tags, cover_image_url, published_at, status, is_featured, author_id, created_at, updated_at, view_count, blog_authors(name, avatar_url, bio)")
    .eq("status", "published")
    .order("view_count", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("DAL: Error fetching popular blog posts:", error);
    return [];
  }

  return (data || []).map(post => {
    const wordCount = (post.excerpt || "").split(/\s+/).filter(Boolean).length;
    const authorData = Array.isArray(post.blog_authors) ? post.blog_authors[0] : post.blog_authors;
    return {
      ...post,
      blog_authors: authorData,
      reading_time: Math.ceil((wordCount * 5) / 200) || 1
    };
  });
});

export const getBlogComments = cache(async (slug: string) => {
  const supabase = createPublicStaticClient();
  const { data, error } = await supabase
    .from("blog_comments")
    .select("*")
    .eq("post_slug", slug)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("DAL: Error fetching blog comments:", error);
    return [];
  }

  return data || [];
});

export const getBlogCategoriesList = cache(async () => {
  const supabase = createPublicStaticClient();
  const { data, error } = await supabase
    .from("blog_categories")
    .select("name, slug")
    .order("name", { ascending: true });

  if (error) {
    console.error("DAL: Error fetching blog categories:", error);
    return [];
  }

  return data || [];
});
