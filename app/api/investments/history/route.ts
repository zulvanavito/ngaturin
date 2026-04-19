import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch the user's investment history, grouped by date
  // For SQLite/Postgres we can just select all and aggregate in JS to keep it simple,
  // or use RPC. We'll group in JS for safety across dialects.
  const { data, error } = await supabase
    .from("investment_history")
    .select("recorded_date, current_value, total_invested")
    .eq("user_id", user.id)
    .order("recorded_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Aggregate by recorded_date
  const aggregated: Record<string, { date: string; value: number; invested: number }> = {};
  
  if (data) {
    data.forEach((row) => {
      if (!aggregated[row.recorded_date]) {
        aggregated[row.recorded_date] = { 
          date: row.recorded_date, 
          value: 0, 
          invested: 0 
        };
      }
      aggregated[row.recorded_date].value += Number(row.current_value);
      aggregated[row.recorded_date].invested += Number(row.total_invested);
    });
  }

  // Convert to array
  const historyData = Object.values(aggregated).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return NextResponse.json(historyData);
}
