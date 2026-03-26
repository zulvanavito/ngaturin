import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const area_id = searchParams.get("area_id");
  const archived = searchParams.get("archived") === "true";

  let query = supabase
    .from("para_resources")
    .select(`*, para_areas(id, name, color)`)
    .eq("user_id", user.id)
    .eq("is_archived", archived)
    .order("last_accessed_at", { ascending: false });

  if (type) query = query.eq("type", type);
  if (area_id) query = query.eq("area_id", area_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, type, content, tags, area_id } = body;

  if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("para_resources")
    .insert({
      user_id: user.id,
      title: title.trim(),
      type: type ?? "Note",
      content,
      tags: tags ?? [],
      area_id: area_id || null,
    })
    .select(`*, para_areas(id, name, color)`)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
