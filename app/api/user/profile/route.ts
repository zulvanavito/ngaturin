import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Try to get existing profile
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Return profile or default values
  return NextResponse.json(data || { payday_day: null, primary_wallet_id: null });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { payday_day, primary_wallet_id } = await request.json();

  // Validate payday_day
  if (payday_day !== null && payday_day !== undefined) {
    const day = Number(payday_day);
    if (isNaN(day) || day < 1 || day > 31) {
      return NextResponse.json({ error: "Tanggal gajian harus antara 1-31" }, { status: 400 });
    }
  }

  // Validate primary_wallet_id belongs to user if provided
  if (primary_wallet_id) {
    const { data: wallet } = await supabase
      .from("wallets")
      .select("id")
      .eq("id", primary_wallet_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!wallet) {
      return NextResponse.json({ error: "Dompet tidak ditemukan" }, { status: 404 });
    }
  }

  // Upsert the profile
  const { data, error } = await supabase
    .from("user_profiles")
    .upsert({
      user_id: user.id,
      payday_day: payday_day !== undefined ? payday_day : null,
      primary_wallet_id: primary_wallet_id || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
