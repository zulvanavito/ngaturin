import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, type, content, tags, area_id, is_archived } = body;

  const updatePayload: Record<string, unknown> = { last_accessed_at: new Date().toISOString() };
  if (title !== undefined) updatePayload.title = title;
  if (type !== undefined) updatePayload.type = type;
  if (content !== undefined) updatePayload.content = content;
  if (tags !== undefined) updatePayload.tags = tags;
  if (area_id !== undefined) updatePayload.area_id = area_id;
  if (is_archived !== undefined) updatePayload.is_archived = is_archived;

  const { data, error } = await supabase
    .from("para_resources")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(`*, para_areas(id, name, color)`)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { error } = await supabase
    .from("para_resources")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
