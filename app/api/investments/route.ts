import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("investments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, type, symbol, amount, total_invested, current_value } = await request.json();
  if (!name?.trim() || !type || total_invested === undefined || current_value === undefined) {
    return NextResponse.json({ error: "Data investasi tidak lengkap" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("investments")
    .insert({
      user_id: user.id,
      name: name.trim(),
      type,
      symbol: symbol?.trim() || null,
      amount: Number(amount || 0),
      total_invested: Number(total_invested),
      current_value: Number(current_value),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
