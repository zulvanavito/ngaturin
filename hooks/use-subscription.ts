"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type SubscriptionStatus = 'free' | 'plus' | 'pro';

export function useSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus>('free');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function getSubscription() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setStatus('free');
          return;
        }

        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "settlement")
          .gt("current_period_end", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setStatus(data.plan_id as SubscriptionStatus);
        } else {
          setStatus('free');
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        setStatus('free');
      } finally {
        setLoading(false);
      }
    }

    getSubscription();
  }, [supabase]);

  return { status, loading, isPlus: status === 'plus' || status === 'pro', isPro: status === 'pro' };
}
