import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();

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

  // Sanitize wallet_id: treat "_none" or empty string as null
  const sanitizedWalletId = (wallet_id && wallet_id !== "_none") ? wallet_id : null;

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      description,
      amount: Number(amount),
      category,
      type,
      date: date || new Date().toISOString().split("T")[0],
      wallet_id: sanitizedWalletId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
