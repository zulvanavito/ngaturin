import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { description, amount, category, type, date, wallet_id } = body;

  // Validation
  if (!description || !amount || !category || !type) {
    return NextResponse.json(
      { error: "Semua field harus diisi" },
      { status: 400 }
    );
  }

  // Allow any non-empty category (supports custom categories from user)
  if (typeof category !== "string" || category.trim().length === 0) {
    return NextResponse.json(
      { error: "Kategori tidak boleh kosong" },
      { status: 400 }
    );
  }

  if (!["income", "expense", "transfer"].includes(type)) {
    return NextResponse.json(
      { error: "Tipe tidak valid" },
      { status: 400 }
    );
  }

  if (isNaN(Number(amount)) || Number(amount) <= 0) {
    return NextResponse.json(
      { error: "Jumlah harus angka positif" },
      { status: 400 }
    );
  }

  // Sanitize wallet_id: treat "_none" or empty string as null
  const sanitizedWalletId = (wallet_id && wallet_id !== "_none") ? wallet_id : null;

  const { data, error } = await supabase
    .from("transactions")
    .update({
      description,
      amount: Number(amount),
      category,
      type,
      date: date || new Date().toISOString().split("T")[0],
      wallet_id: sanitizedWalletId,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Fetch the transaction before deleting to check for debt_id
  const { data: tx } = await supabase
    .from("transactions")
    .select("id, amount, debt_id, type")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!tx) {
    return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
  }

  // 2. If linked to a debt, recalculate or reset debt status
  if (tx.debt_id) {
    const { data: debt } = await supabase
      .from("debts")
      .select("id, amount, paid_amount, is_settled, type")
      .eq("id", tx.debt_id)
      .eq("user_id", user.id)
      .single();

    if (debt) {
      const isMainTransaction = 
        (debt.type === "hutang" && tx.type === "income") || 
        (debt.type === "piutang" && tx.type === "expense");

      if (isMainTransaction) {
        // CASE A: Main transaction deleted -> Full Cleanup
        // 1. Delete all transactions linked to this debt (including payments and self)
        await supabase
          .from("transactions")
          .delete()
          .eq("debt_id", debt.id)
          .eq("user_id", user.id);

        // 2. Delete the debt record itself
        await supabase
          .from("debts")
          .delete()
          .eq("id", debt.id)
          .eq("user_id", user.id);

        // Since we already deleted the main transaction (self) in step 1, 
        // we can return success early.
        return NextResponse.json({ success: true });
      } else {
        // CASE B: Payment transaction deleted -> Normal recalculation (Existing Logic)
        const newPaidAmount = Math.max((debt.paid_amount || 0) - Number(tx.amount), 0);
        const isStillSettled = newPaidAmount >= debt.amount;

        await supabase
          .from("debts")
          .update({
            paid_amount: newPaidAmount,
            is_settled: isStillSettled,
          })
          .eq("id", debt.id)
          .eq("user_id", user.id);
      }
    }
  }

  // 3. Delete the transaction
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Transaksi berhasil dihapus" });
}
