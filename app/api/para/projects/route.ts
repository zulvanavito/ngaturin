import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // 'active' | 'archived' | null (all)

  let query = supabase
    .from("para_projects")
    .select(`
      *,
      para_areas(id, name, color),
      para_tasks(id, title, is_done)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, outcome, deadline, area_id } = body;

  if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  if (!outcome?.trim()) return NextResponse.json({ error: "Outcome is required" }, { status: 400 });

  // Check active project limit (max 5)
  const { count } = await supabase
    .from("para_projects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "active");

  if ((count ?? 0) >= 5) {
    return NextResponse.json(
      { error: "Kamu sudah punya 5 project aktif. Selesaikan atau arsipkan dulu sebelum membuat yang baru." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("para_projects")
    .insert({ user_id: user.id, title: title.trim(), outcome: outcome.trim(), deadline, area_id: area_id || null })
    .select(`*, para_areas(id, name, color), para_tasks(id, title, is_done)`)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
