import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * TypeScript Safety Rationale:
 * Using Zod for profile update validation (Mandate #5).
 * Removing 'any' update object by using a typed record.
 */

const profileUpdateSchema = z.object({
  payday_day: z.number().min(1).max(31).nullable().optional(),
  primary_wallet_id: z.string().uuid().nullable().optional(),
  show_decimals: z.boolean().optional(),
  accent_color: z.string().optional(),
  showDecimals: z.boolean().optional(),
  accentColor: z.string().optional(),
  budget_needs_target: z.number().min(0).max(100).optional(),
  budget_wants_target: z.number().min(0).max(100).optional(),
  budget_savings_target: z.number().min(0).max(100).optional(),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Try to get existing profile
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Return profile or default values
  return NextResponse.json(data || { 
    payday_day: null, 
    primary_wallet_id: null,
    show_decimals: false,
    accent_color: 'wise-green',
    budget_needs_target: 50,
    budget_wants_target: 30,
    budget_savings_target: 20
  });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rawBody = await request.json();
    const result = profileUpdateSchema.safeParse(rawBody);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid request data", details: result.error.format() }, { status: 400 });
    }

    const { 
      payday_day, primary_wallet_id, show_decimals, accent_color, showDecimals, accentColor,
      budget_needs_target, budget_wants_target, budget_savings_target
    } = result.data;

    // Map camelCase to snake_case for backward compatibility and frontend consistency
    const finalShowDecimals = show_decimals !== undefined ? show_decimals : showDecimals;
    const finalAccentColor = accent_color !== undefined ? accent_color : accentColor;

    // Prepare update object with explicit keys to avoid 'any'
    const updateData: Record<string, string | number | boolean | null> = {
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    if (payday_day !== undefined) {
      updateData.payday_day = payday_day;
    }

    if (primary_wallet_id !== undefined) {
      // Validate primary_wallet_id belongs to user if provided
      if (primary_wallet_id) {
        const { data: wallet } = await supabase
          .from("wallets")
          .select("id")
          .eq("id", primary_wallet_id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (!wallet) {
          return NextResponse.json({ error: "Dompet tidak ditemukan" }, { status: 404 });
        }
      }
      updateData.primary_wallet_id = primary_wallet_id;
    }

    if (finalShowDecimals !== undefined) {
      updateData.show_decimals = finalShowDecimals;
    }

    if (finalAccentColor !== undefined) {
      updateData.accent_color = finalAccentColor;
    }

    if (budget_needs_target !== undefined && budget_wants_target !== undefined && budget_savings_target !== undefined) {
      if (budget_needs_target + budget_wants_target + budget_savings_target !== 100) {
        return NextResponse.json({ error: "Total persentase anggaran harus tepat 100%" }, { status: 400 });
      }
      updateData.budget_needs_target = budget_needs_target;
      updateData.budget_wants_target = budget_wants_target;
      updateData.budget_savings_target = budget_savings_target;
    }

    // Upsert the profile
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(updateData, { onConflict: "user_id" })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    
    // Purge the cache for the entire dashboard layout to ensure fresh data on navigation
    revalidatePath("/dashboard", "layout");
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Profile Update Error:", error);
    return NextResponse.json({ error: "Gagal memproses request" }, { status: 400 });
  }
}
