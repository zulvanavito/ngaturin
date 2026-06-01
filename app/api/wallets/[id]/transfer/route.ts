import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { handleGamifiedAction } from "@/lib/gamification-service";

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

  const { data: wallets } = await supabase.from("wallets")
    .select("id").eq("user_id", user.id).in("id", [fromWalletId, toWalletId]);

  if (!wallets || wallets.length !== 2) {
    return NextResponse.json({ error: "Dompet tidak ditemukan" }, { status: 404 });
  }

  const transferDate = date || new Date().toISOString().split("T")[0];
  const transferDesc = description || "Transfer Antar Dompet";

  const { error } = await supabase.rpc("transfer_funds", {
    p_from_wallet_id: fromWalletId,
    p_to_wallet_id: toWalletId,
    p_amount: Number(amount),
    p_description: transferDesc,
    p_date: transferDate,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Trigger Gamification
  try {
    await handleGamifiedAction(user.id, 10);
  } catch (gamiError) {
    console.error("Gamification error:", gamiError);
  }

  return NextResponse.json({ message: "Transfer berhasil" }, { status: 201 });
}
