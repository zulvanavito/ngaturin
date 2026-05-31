import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { format } from "date-fns";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const currentMonth = format(new Date(), "yyyy-MM");
  const month = searchParams.get("month") || currentMonth;

  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .eq("month", month)
    .order("category", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { category, amount, month } = body;

  if (!category || amount === undefined || !month) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Check if budget for this category and month already exists
  const { data: existing } = await supabase
    .from("budgets")
    .select("id")
    .eq("user_id", user.id)
    .eq("category", category)
    .eq("month", month)
    .single();

  if (existing) {
    // If it exists, we could either error out or update it. Let's return error so frontend uses PUT.
    return NextResponse.json({ error: "Budget for this category already exists this month" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("budgets")
    .insert({
      user_id: user.id,
      category,
      amount,
      month
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
