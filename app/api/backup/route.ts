import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET: export all user data as JSON
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [transactions, budgets, categories, bills, debts, wallets] = await Promise.all([
    supabase.from("transactions").select("*").eq("user_id", user.id),
    supabase.from("budgets").select("*").eq("user_id", user.id),
    supabase.from("categories").select("*").eq("user_id", user.id),
    supabase.from("recurring_bills").select("*").eq("user_id", user.id),
    supabase.from("debts").select("*").eq("user_id", user.id),
    supabase.from("wallets").select("*").eq("user_id", user.id),
  ]);

  return NextResponse.json({
    exported_at: new Date().toISOString(),
    version: "1.0",
    transactions: transactions.data || [],
    budgets: budgets.data || [],
    categories: categories.data || [],
    recurring_bills: bills.data || [],
    debts: debts.data || [],
    wallets: wallets.data || [],
  });
}

// POST: import transactions from JSON backup
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { transactions } = body;

  if (!Array.isArray(transactions) || transactions.length === 0) {
    return NextResponse.json({ error: "Tidak ada data transaksi untuk diimpor" }, { status: 400 });
  }

  // Strip IDs and set user_id so they're re-inserted as new records
  const cleaned = transactions.map(({ id: _id, user_id: _uid, created_at: _ca, ...rest }: any) => ({
    ...rest,
    user_id: user.id,
  }));

  const { error } = await supabase.from("transactions").insert(cleaned);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ imported: cleaned.length });
}
