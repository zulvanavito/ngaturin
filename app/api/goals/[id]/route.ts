import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  
  // Prepare update data
  const updateData: Record<string, string | number | boolean | null> = {
    updated_at: new Date().toISOString()
  };
  
  if (body.title !== undefined) updateData.title = body.title.trim();
  if (body.description !== undefined) updateData.description = body.description?.trim();
  if (body.target_amount !== undefined) updateData.target_amount = Number(body.target_amount);
  if (body.current_amount !== undefined) updateData.current_amount = Number(body.current_amount);
  if (body.deadline !== undefined) updateData.deadline = body.deadline || null;
  if (body.category !== undefined) updateData.category = body.category?.trim();
  if (body.color !== undefined) updateData.color = body.color;
  if (body.is_completed !== undefined) updateData.is_completed = body.is_completed;
  if (body.is_auto_save !== undefined) updateData.is_auto_save = body.is_auto_save;
  if (body.auto_save_amount !== undefined) updateData.auto_save_amount = body.is_auto_save ? Number(body.auto_save_amount) : 0;

  // Auto-check completion if amounts updated
  if (updateData.current_amount !== undefined || updateData.target_amount !== undefined) {
    const cur = updateData.current_amount ?? body.current_amount;
    const tar = updateData.target_amount ?? body.target_amount;
    if (cur !== undefined && tar !== undefined) {
      updateData.is_completed = Number(cur) >= Number(tar);
    }
  }

  const { data, error } = await supabase
    .from("goals")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
