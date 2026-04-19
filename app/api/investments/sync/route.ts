import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { fetchAssetPrice } from "@/lib/finance-api";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1. Fetch investments that have a symbol
  const { data: investments, error } = await supabase
    .from("investments")
    .select("*")
    .eq("user_id", user.id)
    .not("symbol", "is", null)
    .neq("symbol", "");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!investments || investments.length === 0) {
    return NextResponse.json({ message: "No assets with symbols found to sync.", updated: 0 });
  }

  let updatedCount = 0;
  const errors: any[] = [];

  // Exchange rate placeholder (Ideal: fetch dynamic USD-IDR rate if needed)
  const EXCHANGE_RATE_USD_IDR = 16000; 

  // 2. Process each investment
  for (const asset of investments) {
    if (!asset.symbol || !asset.amount) continue;

    const result = await fetchAssetPrice(asset.symbol, asset.type);
    
    if (result.success) {
      let finalPrice = result.price;
      
      // Convert to IDR if the raw price from Yahoo is in USD
      // This happens often for Kripto (e.g., BTC-USD)
      if (result.currency === 'USD') {
         finalPrice = result.price * EXCHANGE_RATE_USD_IDR;
      }

      // Calculate new value
      const newValue = finalPrice * asset.amount;

      // Update Database
      const { error: updateError } = await supabase
        .from("investments")
        .update({ 
          current_value: newValue,
          // We could optionally store 'last_synced_at' on the table later
        })
        .eq("id", asset.id);

      if (updateError) {
        errors.push({ symbol: asset.symbol, error: updateError.message });
      } else {
        updatedCount++;
      }
    } else {
      errors.push({ symbol: asset.symbol, error: result.error });
    }
  }

  return NextResponse.json({
    message: `Successfully synced ${updatedCount} assets.`,
    updated: updatedCount,
    errors: errors.length > 0 ? errors : undefined,
  }, { status: 200 });
}
