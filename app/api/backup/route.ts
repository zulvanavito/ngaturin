import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * TypeScript Safety Rationale:
 * We use Zod for external data validation (Mandate #5) to ensure that backup files
 * follow the expected structure before processing. This eliminates the need for
 * 'any' assertions and provides a single source of truth for the import shape.
 */

// Zod schema for transaction backup
const transactionBackupSchema = z.object({
  description: z.string(),
  amount: z.number().or(z.string().transform(val => Number(val))),
  category: z.string(),
  type: z.enum(["income", "expense", "transfer"]),
  date: z.string(),
  wallet_id: z.string().nullable().optional(),
  category_icon: z.string().nullable().optional(),
  debt_id: z.string().nullable().optional(),
});

const importSchema = z.object({
  transactions: z.array(transactionBackupSchema),
});

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

  try {
    const rawBody = await request.json();
    
    // Validate incoming data using Zod
    const result = importSchema.safeParse(rawBody);
    
    if (!result.success) {
      return NextResponse.json({ 
        error: "Format data tidak valid", 
        details: result.error.format() 
      }, { status: 400 });
    }

    const { transactions } = result.data;

    if (transactions.length === 0) {
      return NextResponse.json({ error: "Tidak ada data transaksi untuk diimpor" }, { status: 400 });
    }

    // Strip IDs and set user_id so they're re-inserted as new records
    // Logic: We explicitly omit metadata fields to ensure fresh insertion
    const cleaned = transactions.map((tx) => ({
      description: tx.description,
      amount: tx.amount,
      category: tx.category,
      type: tx.type,
      date: tx.date,
      wallet_id: tx.wallet_id,
      category_icon: tx.category_icon,
      debt_id: tx.debt_id,
      user_id: user.id,
    }));

    const { error } = await supabase.from("transactions").insert(cleaned);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ imported: cleaned.length });
  } catch (err) {
    return NextResponse.json({ error: "Gagal memproses request" }, { status: 400 });
  }
}
