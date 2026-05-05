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
  return NextResponse.json(data || { 
    payday_day: null, 
    primary_wallet_id: null,
    show_decimals: false,
    accent_color: 'wise-green'
  });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { payday_day, primary_wallet_id, show_decimals, accent_color, showDecimals, accentColor } = body;

  // Map camelCase to snake_case for backward compatibility and frontend consistency
  const finalShowDecimals = show_decimals !== undefined ? show_decimals : showDecimals;
  const finalAccentColor = accent_color !== undefined ? accent_color : accentColor;

  // Prepare update object
  const updateData: any = {
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  if (payday_day !== undefined) {
    // Validate payday_day
    if (payday_day !== null) {
      const day = Number(payday_day);
      if (isNaN(day) || day < 1 || day > 31) {
        return NextResponse.json({ error: "Tanggal gajian harus antara 1-31" }, { status: 400 });
      }
    }
    updateData.payday_day = payday_day;
  }

  if (primary_wallet_id !== undefined) {
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
    updateData.primary_wallet_id = primary_wallet_id;
  }

  if (finalShowDecimals !== undefined) {
    updateData.show_decimals = finalShowDecimals;
  }

  if (finalAccentColor !== undefined) {
    updateData.accent_color = finalAccentColor;
  }

  // Upsert the profile
  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(updateData, { onConflict: "user_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
