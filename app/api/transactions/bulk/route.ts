import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { handleGamifiedAction } from "@/lib/gamification-service";

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

  // Trigger gamification
  try {
    await handleGamifiedAction(user.id, 10 * payload.length);
  } catch (err) {
    console.error("Failed to update gamification stats:", err);
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

  // 1. Fetch transactions to check for debt links
  const { data: txs } = await supabase
    .from("transactions")
    .select("id, amount, debt_id, type")
    .in("id", ids)
    .eq("user_id", user.id);

  // 2. Group debt-linked transactions by debt_id
  if (txs && txs.length > 0) {
    const debtAdjustments: Record<string, number> = {};
    for (const tx of txs) {
      if (tx.debt_id) {
        debtAdjustments[tx.debt_id] = (debtAdjustments[tx.debt_id] || 0) + Number(tx.amount);
      }
    }

    // 3. Process each affected debt
    for (const [debtId, totalSubtract] of Object.entries(debtAdjustments)) {
      const { data: debt } = await supabase
        .from("debts")
        .select("id, amount, paid_amount, is_settled, type")
        .eq("id", debtId)
        .eq("user_id", user.id)
        .single();

      if (debt) {
        // Check if any of the deleted transactions for this debt was a "Main Transaction"
        const deletedMainTx = txs.find(tx => 
          tx.debt_id === debtId && 
          ((debt.type === "hutang" && tx.type === "income") || 
           (debt.type === "piutang" && tx.type === "expense"))
        );

        if (deletedMainTx) {
          // CASE A: One of the deleted txs was MAIN -> Cleanup everything
          // 1. Delete all transactions linked to this debt
          await supabase
            .from("transactions")
            .delete()
            .eq("debt_id", debt.id)
            .eq("user_id", user.id);

          // 2. Delete the debt record
          await supabase
            .from("debts")
            .delete()
            .eq("id", debt.id)
            .eq("user_id", user.id);
        } else {
          // CASE B: Only payments were deleted -> Recalculate
          const newPaidAmount = Math.max((debt.paid_amount || 0) - totalSubtract, 0);
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
  }

  // 4. Delete all transactions
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
