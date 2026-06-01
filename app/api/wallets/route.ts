import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/utils/api-error";
import { WalletCreateSchema } from "@/lib/validations/finance";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data: wallets, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    
    if (error) throw error;

    return NextResponse.json(wallets || []);

  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Unauthorized");
    }

    // 1. Validate Request Body
    const body = await request.json();
    const validated = WalletCreateSchema.parse(body);

    // 2. Execute Insert
    const { data, error } = await supabase
      .from("wallets")
      .insert({
        user_id: user.id,
        name: validated.name,
        icon: validated.icon,
        type: validated.type,
        color: validated.color,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    return handleApiError(error);
  }
}
