import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, icon, type } = await request.json();
  if (!name || name.trim().length === 0) {
    return NextResponse.json({ error: "Nama kategori tidak boleh kosong" }, { status: 400 });
  }
  if (!["expense", "income", "all"].includes(type)) {
    return NextResponse.json({ error: "Tipe tidak valid" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({ user_id: user.id, name: name.trim(), icon: icon || "📦", type })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: `Kategori "${name}" sudah ada` }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
