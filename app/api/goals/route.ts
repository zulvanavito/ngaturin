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

  const { title, description, target_amount, current_amount, deadline, category, color, is_auto_save, auto_save_amount } = await request.json();
  
  if (!title?.trim() || target_amount === undefined) {
    return NextResponse.json({ error: "Judul dan target nominal wajib diisi" }, { status: 400 });
  }

  // Validate auto_save_amount if auto-save is enabled
  if (is_auto_save && (!auto_save_amount || Number(auto_save_amount) <= 0)) {
    return NextResponse.json({ error: "Nominal auto-save harus lebih dari 0" }, { status: 400 });
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
      is_completed: Number(current_amount || 0) >= Number(target_amount),
      is_auto_save: is_auto_save || false,
      auto_save_amount: is_auto_save ? Number(auto_save_amount) : 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
