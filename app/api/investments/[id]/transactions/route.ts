import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // In Next.js 15, params is a Promise
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;

  const { data, error } = await supabase
    .from("investment_transactions")
    .select("*")
    .eq("investment_id", resolvedParams.id)
    .eq("user_id", user.id)
    .order("transaction_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;
  const { type, amount, price_per_unit, total_value, transaction_date, notes } = await request.json();

  if (!type || !total_value) {
    return NextResponse.json({ error: "Missng required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("investment_transactions")
    .insert({
      investment_id: resolvedParams.id,
      user_id: user.id,
      type,
      amount: Number(amount || 0),
      price_per_unit: Number(price_per_unit || 0),
      total_value: Number(total_value),
      transaction_date: transaction_date || new Date().toISOString(),
      notes: notes || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
