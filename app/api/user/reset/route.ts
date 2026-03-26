import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tables = [
    // Financial tables
    "transactions",
    "wallets",
    "categories",
    "investments",
    "debts",
    "recurring_bills",
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
