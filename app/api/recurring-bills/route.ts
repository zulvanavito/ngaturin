import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("recurring_bills").select("*").eq("user_id", user.id)
    .order("due_day", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, amount, category, due_day } = await request.json();
  if (!name?.trim() || !amount || !due_day) {
    return NextResponse.json({ error: "Data tagihan tidak lengkap" }, { status: 400 });
  }

  const { data, error } = await supabase.from("recurring_bills")
    .insert({ user_id: user.id, name: name.trim(), amount: Number(amount), category, due_day: Number(due_day) })
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
