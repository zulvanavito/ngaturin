import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { coreApi } from "@/lib/midtrans";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json({ error: "Server configuration error: Missing service role key" }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    // 1. Fetch from Midtrans API directly
    const midtransStatus = await coreApi.transaction.status(orderId);
    
    // 2. Map Midtrans transaction_status to our DB status
    const { transaction_status } = midtransStatus;
    let newStatus = "pending";
    if (transaction_status === "settlement" || transaction_status === "capture") {
      newStatus = "settlement";
    } else if (transaction_status === "expire") {
      newStatus = "expire";
    } else if (transaction_status === "cancel" || transaction_status === "deny") {
      newStatus = "cancel";
    }

    // 3. Get current subscription from DB
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("midtrans_order_id", orderId)
      .single();

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    // 4. Update if status changed
    if (subscription.status !== newStatus) {
      const updateData: Record<string, string> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === "settlement" && subscription.status !== "settlement") {
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

      await supabaseAdmin
        .from("subscriptions")
        .update(updateData)
        .eq("midtrans_order_id", orderId);
    }

    // Return the latest mapped status
    return NextResponse.json({ status: newStatus });
  } catch (error: unknown) {
    console.error("Check Status Error:", error);
    // If midtrans throws a 404, it might mean the order doesn't exist on their side yet
    const msg = error instanceof Error ? error.message : "Failed to check status";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
