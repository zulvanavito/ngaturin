import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: wallets, error } = await supabase
    .from("wallets").select("*").eq("user_id", user.id)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch ALL transactions (including transfers) to calculate per-wallet balance
  const { data: txs } = await supabase
    .from("transactions")
    .select("wallet_id, type, amount, description")
    .eq("user_id", user.id);

  // Build balance map: wallet_id → net balance
  const balanceMap: Record<string, number> = {};
  for (const tx of txs ?? []) {
    if (!tx.wallet_id) continue;
    if (!balanceMap[tx.wallet_id]) balanceMap[tx.wallet_id] = 0;

    if (tx.type === "income") {
      balanceMap[tx.wallet_id] += Number(tx.amount);
    } else if (tx.type === "expense") {
      balanceMap[tx.wallet_id] -= Number(tx.amount);
    } else if (tx.type === "transfer") {
      // Direction determined by description suffix set in the transfer API
      if (tx.description?.endsWith("→ masuk")) {
        balanceMap[tx.wallet_id] += Number(tx.amount); // incoming
      } else if (tx.description?.endsWith("→ keluar")) {
        balanceMap[tx.wallet_id] -= Number(tx.amount); // outgoing
      }
    }
  }

  const walletsWithBalance = (wallets ?? []).map((w) => ({
    ...w,
    balance: balanceMap[w.id] ?? 0,
  }));

  return NextResponse.json(walletsWithBalance);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, icon, type, color } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nama dompet tidak boleh kosong" }, { status: 400 });

  const { data, error } = await supabase.from("wallets")
    .insert({ user_id: user.id, name: name.trim(), icon: icon || "💳", type: type || "bank", color: color || "#10b981" })
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
