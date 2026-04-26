import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const type = searchParams.get("type");
  const keyword = searchParams.get("keyword");
  const month = searchParams.get("month");
  const walletId = searchParams.get("wallet_id");

  let query = supabase
    .from("transactions")
    .select("*, wallets(name), debt_id")
    .eq("user_id", user.id);

  if (category) {
    query = query.eq("category", category);
  }
  
  if (type) {
    query = query.eq("type", type);
  }

  if (keyword) {
    query = query.ilike("description", `%${keyword}%`);
  }

  if (month) {
    // month is expected to be in "YYYY-MM" format
    const startDate = `${month}-01`;
    // Create a date for the 1st of the next month to handle days correctly
    const [yearStr, monthStr] = month.split('-');
    const nextMonth = new Date(Number(yearStr), Number(monthStr), 1);
    const endDate = new Date(nextMonth.getTime() - 1).toISOString().split('T')[0];
    
    query = query.gte("date", startDate).lte("date", endDate);
  }

  if (walletId) {
    query = query.eq("wallet_id", walletId);
  }

  const { data, error } = await query
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
  const { description, amount, category, type, date, wallet_id, bill_id, debt_id } = body;

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
      bill_id: bill_id || null,
      debt_id: debt_id || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
