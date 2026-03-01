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
  const { description, amount, category, type, date } = body;

  // Validation
  if (!description || !amount || !category || !type) {
    return NextResponse.json(
      { error: "Semua field harus diisi" },
      { status: 400 }
    );
  }

  const validCategories = ["Makanan", "Transport", "Belanja", "Tagihan", "Gaji", "Lainnya"];
  if (!validCategories.includes(category)) {
    return NextResponse.json(
      { error: "Kategori tidak valid" },
      { status: 400 }
    );
  }

  if (!["income", "expense"].includes(type)) {
    return NextResponse.json(
      { error: "Tipe harus 'income' atau 'expense'" },
      { status: 400 }
    );
  }

  if (isNaN(Number(amount)) || Number(amount) <= 0) {
    return NextResponse.json(
      { error: "Jumlah harus angka positif" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("transactions")
    .update({
      description,
      amount: Number(amount),
      category,
      type,
      date: date || new Date().toISOString().split("T")[0],
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
