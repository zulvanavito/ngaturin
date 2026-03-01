import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/wallets/[id]/transfer
// Body: { toWalletId: string, amount: number, description: string, date: string }
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: fromWalletId } = await params;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { toWalletId, amount, description, date } = await request.json();
  if (!toWalletId || !amount || amount <= 0) {
    return NextResponse.json({ error: "Data transfer tidak valid" }, { status: 400 });
  }
  if (fromWalletId === toWalletId) {
    return NextResponse.json({ error: "Dompet sumber dan tujuan tidak boleh sama" }, { status: 400 });
  }

  // Verify both wallets belong to the user
  const { data: wallets } = await supabase.from("wallets")
    .select("id").eq("user_id", user.id).in("id", [fromWalletId, toWalletId]);

  if (!wallets || wallets.length !== 2) {
    return NextResponse.json({ error: "Dompet tidak ditemukan" }, { status: 404 });
  }

  const transferDate = date || new Date().toISOString().split("T")[0];
  const transferDesc = description || "Transfer Antar Dompet";

  // Insert 2 transactions atomically: expense from source, income to target
  const { error } = await supabase.from("transactions").insert([
    {
      user_id: user.id,
      wallet_id: fromWalletId,
      type: "expense",
      amount: Number(amount),
      category: "Transfer",
      description: `${transferDesc} (keluar)`,
      date: transferDate,
    },
    {
      user_id: user.id,
      wallet_id: toWalletId,
      type: "income",
      amount: Number(amount),
      category: "Transfer",
      description: `${transferDesc} (masuk)`,
      date: transferDate,
    },
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Transfer berhasil" }, { status: 201 });
}
