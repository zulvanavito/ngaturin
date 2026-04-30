import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";

// We use service role key to bypass RLS for webhook updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      payment_type,
    } = body;

    // Verify signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const hash = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (hash !== signature_key) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    console.log(`Webhook received for ${order_id}: ${transaction_status}`);

    // Map Midtrans status to our status
    let status = "pending";
    if (transaction_status === "settlement" || transaction_status === "capture") {
      status = "settlement";
    } else if (transaction_status === "expire") {
      status = "expire";
    } else if (transaction_status === "cancel" || transaction_status === "deny") {
      status = "cancel";
    }

    // Get the subscription to know the interval
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("midtrans_order_id", order_id)
      .single();

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    // Update subscription
    const updateData: any = {
      status,
      payment_type,
      updated_at: new Date().toISOString(),
    };

    if (status === "settlement") {
      const now = new Date();
      const end = new Date();
      if (subscription.interval === "monthly") {
        end.setMonth(now.getMonth() + 1);
      } else {
        end.setFullYear(now.getFullYear() + 1);
      }
      updateData.current_period_start = now.toISOString();
      updateData.current_period_end = end.toISOString();
    }

    const { error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .update(updateData)
      .eq("midtrans_order_id", order_id);

    if (updateError) {
      console.error("Webhook Update Error:", updateError);
      return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
    }

    return NextResponse.json({ status: "ok" });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
