import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { error } = await supabase
      .from("user_profiles")
      .upsert({ 
        user_id: user.id, 
        last_email_change_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Update Email Timestamp Error:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan sistem";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
