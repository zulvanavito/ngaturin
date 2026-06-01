import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { handleGamifiedAction } from "@/lib/gamification-service";
import { handleApiError } from "@/lib/utils/api-error";
import { TransactionCreateSchema, TransactionQuerySchema } from "@/lib/validations/finance";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Validate Query Parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const filters = TransactionQuerySchema.parse(queryParams);

    // 2. Build Query
    let query = supabase
      .from("transactions")
      .select("*, wallets(name), debt_id")
      .eq("user_id", user.id);

    if (filters.category) query = query.eq("category", filters.category);
    if (filters.type) query = query.eq("type", filters.type);
    if (filters.keyword) query = query.ilike("description", `%${filters.keyword}%`);

    if (filters.month) {
      // month is in "YYYY-MM" format
      const startDate = `${filters.month}-01`;
      const [yearStr, monthStr] = filters.month.split('-');
      const nextMonth = new Date(Number(yearStr), Number(monthStr), 1);
      const endDate = new Date(nextMonth.getTime() - 1).toISOString().split('T')[0];
      query = query.gte("date", startDate).lte("date", endDate);
    }

    if (filters.wallet_id) {
      query = query.eq("wallet_id", filters.wallet_id);
    }

    // 3. Execute Query
    const { data, error } = await query
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);

  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Validate Request Body
    const body = await request.json();
    const validated = TransactionCreateSchema.parse(body);

    // 2. Execute Insert
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        description: validated.description,
        amount: validated.amount,
        category: validated.category,
        type: validated.type,
        date: validated.date || new Date().toISOString().split("T")[0],
        wallet_id: validated.wallet_id,
        bill_id: validated.bill_id,
        debt_id: validated.debt_id,
      })
      .select()
      .single();

    if (error) throw error;

    // 3. Trigger Gamification
    try {
      await handleGamifiedAction(user.id);
    } catch (err) {
      console.error("Gamification error (non-blocking):", err);
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    return handleApiError(error);
  }
}
