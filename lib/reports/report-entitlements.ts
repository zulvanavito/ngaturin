import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/dal";
import type { ReportExportEntitlements } from "./export-types";

const EXPORT_FEATURES = [
  "reports.export.csv",
  "reports.export.excel",
  "reports.export.pdf",
  "reports.debt_export",
  "reports.ai_insight",
  "reports.investment_snapshot",
  "reports.advanced_trends",
];

export async function getReportEntitlements(): Promise<ReportExportEntitlements> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return createDefaultEntitlements("free");
  }

  try {
    // Attempt to use the RPC if it exists
    const { data: planData, error: planError } = await supabase
      .rpc("get_user_active_plan", { target_user_id: user.id });

    let activePlan: "free" | "plus" | "pro" = "free";

    if (!planError && planData) {
      activePlan = planData.toLowerCase() as "free" | "plus" | "pro";
    } else {
      // Fallback to checking subscriptions table
      const sub = await getSubscription();
      if (sub) {
        // Map price_id to plan name (assuming basic mapping logic or just fallback to 'pro' if there's any active sub for MVP)
        activePlan = sub.price_id?.includes("plus") ? "plus" : "pro";
      }
    }

    const entitlements = createDefaultEntitlements(activePlan);

    return entitlements;
  } catch (error) {
    console.error("Error fetching report entitlements:", error);
    return createDefaultEntitlements("free");
  }
}

function createDefaultEntitlements(plan: "free" | "plus" | "pro"): ReportExportEntitlements {
  const isPlus = plan === "plus" || plan === "pro";
  const isPro = plan === "pro";

  return {
    activePlan: plan,
    features: {
      "reports.export.csv": { isEnabled: true, limitValue: null },
      "reports.export.excel": { isEnabled: isPlus, limitValue: null },
      "reports.export.pdf": { isEnabled: isPlus, limitValue: null },
      "reports.debt_export": { isEnabled: isPlus, limitValue: null },
      "reports.ai_insight": { isEnabled: isPlus, limitValue: null }, // Plus has limited AI insight, Pro has full. We'll handle 'limited' in UI or via limitValue if needed
      "reports.investment_snapshot": { isEnabled: isPro, limitValue: null },
      "reports.advanced_trends": { isEnabled: isPro, limitValue: null },
    }
  };
}
