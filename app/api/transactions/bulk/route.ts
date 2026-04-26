import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { transactions } = body;

  if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
    return NextResponse.json({ error: "Data transaksi tidak valid" }, { status: 400 });
  }

  // Validate each transaction
  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i];
    if (!t.description || !t.amount || !t.category || !t.type) {
      return NextResponse.json(
        { error: `Baris ${i + 1}: Semua field wajib harus diisi` },
        { status: 400 }
      );
    }
    if (!["income", "expense"].includes(t.type)) {
      return NextResponse.json(
        { error: `Baris ${i + 1}: Tipe harus 'income' atau 'expense'` },
        { status: 400 }
      );
    }
    if (isNaN(Number(t.amount)) || Number(t.amount) <= 0) {
      return NextResponse.json(
        { error: `Baris ${i + 1}: Jumlah harus angka positif` },
        { status: 400 }
      );
    }
  }

  const payload = transactions.map((t: { description: string; amount: number; category: string; type: string; date?: string; wallet_id?: string }) => ({
    user_id: user.id,
    description: t.description,
    amount: Number(t.amount),
    category: t.category,
    type: t.type,
    date: t.date || new Date().toISOString().split("T")[0],
    wallet_id: (t.wallet_id && t.wallet_id !== "_none") ? t.wallet_id : null,
  }));

  const { data, error } = await supabase
    .from("transactions")
    .insert(payload)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { ids } = await request.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "IDs tidak valid" }, { status: 400 });
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .in("id", ids)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Transaksi berhasil dihapus" });
}
