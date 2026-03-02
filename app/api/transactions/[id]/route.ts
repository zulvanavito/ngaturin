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
