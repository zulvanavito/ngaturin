import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { handleGamifiedAction } from "@/lib/gamification-service";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { investments } = await req.json();

    if (!Array.isArray(investments) || investments.length === 0) {
      return NextResponse.json({ error: "No valid investments provided" }, { status: 400 });
    }

    const payload = investments.map(inv => ({
      user_id: user.id,
      name: inv.name,
      type: inv.type,
      symbol: inv.symbol || null,
      amount: Number(inv.amount || 0),
      total_invested: Number(inv.total_invested || 0),
      current_value: Number(inv.current_value || 0),
    }));

    const { data, error } = await supabase
      .from("investments")
      .insert(payload)
      .select();

    if (error) throw error;

    // Trigger Gamification
    try {
      await handleGamifiedAction(user.id, 10 * payload.length);
    } catch (gamiError) {
      console.error("Gamification error:", gamiError);
    }

    return NextResponse.json({ message: "Import success", data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
