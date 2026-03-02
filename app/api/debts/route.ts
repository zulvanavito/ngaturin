import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", user.id)
    .order("due_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, person_name, amount, description, due_date } = await request.json();
  if (!type || !person_name?.trim() || !amount) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("debts")
    .insert({
      user_id: user.id,
      type,
      person_name: person_name.trim(),
      amount: Number(amount),
      description: description?.trim() || null,
      due_date: due_date || null,
      is_settled: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
