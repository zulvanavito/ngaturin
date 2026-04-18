import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("goals")
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

  const { title, description, target_amount, current_amount, deadline, category, color } = await request.json();
  
  if (!title?.trim() || target_amount === undefined) {
    return NextResponse.json({ error: "Judul dan target nominal wajib diisi" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      target_amount: Number(target_amount),
      current_amount: Number(current_amount || 0),
      deadline: deadline || null,
      category: category?.trim() || null,
      color: color || "#9fe870",
      is_completed: Number(current_amount || 0) >= Number(target_amount)
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
