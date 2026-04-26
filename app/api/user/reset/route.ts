import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tables = [
    // Children first (FK constraints)
    "investment_history",
    "investment_transactions",
    "transactions",
    // Parent financial tables
    "wallets",
    "categories",
    "investments",
    "debts",
    "recurring_bills",
    "goals",
    "budgets",
    // PARA tables (children first due to FK constraints)
    "para_resources",
    "para_tasks",
    "para_projects",
    "para_areas",
  ];

  try {
    for (const table of tables) {
      await supabase.from(table).delete().eq("user_id", user.id);
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan sistem";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
