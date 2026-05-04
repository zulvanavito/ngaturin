import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import SubscriptionReceiptEmail from "@/components/emails/subscription-receipt";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );
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

    // Idempotency check: if already settled in DB and incoming is settlement, ignore
    if (subscription.status === "settlement" && status === "settlement") {
      console.log(`Order ${order_id} is already settled, ignoring webhook.`);
      return NextResponse.json({ status: "ok", message: "Already processed" });
    }

    // Update subscription
    const updateData: Record<string, string> = {
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

    // --- Send Email Confirmation if newly settled ---
    if (status === "settlement" && subscription.status !== "settlement") {
      try {
        // Fetch user email using Supabase Admin
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(subscription.user_id);
        const userEmail = userData?.user?.email;

        if (userEmail) {
          const planName = subscription.plan_id === "plus" ? "Ngaturin PLUS" : "Ngaturin PRO";
          const planInterval = subscription.interval === "monthly" ? "Bulanan" : "Tahunan";
          
          await resend.emails.send({
            from: "Ngaturin <noreply@ngaturin.com>", // Ganti dengan domain terverifikasi Anda
            to: [userEmail],
            subject: "Pembayaran Berhasil: Tanda Terima Ngaturin",
            react: SubscriptionReceiptEmail({
              customerName: userData?.user?.user_metadata?.full_name || "Pengguna",
              orderId: order_id,
              planName: `${planName} (${planInterval})`,
              amount: subscription.amount,
              paymentMethod: payment_type ? payment_type.replace(/_/g, " ").toUpperCase() : "Online Payment",
            }),
          });
          console.log(`Confirmation email sent successfully to ${userEmail}`);
        } else {
          console.warn("User email not found for sending receipt.");
        }
      } catch (emailErr) {
        // Do not fail the webhook if email fails
        console.error("Failed to send receipt email:", emailErr);
      }
    }

    return NextResponse.json({ status: "ok" });

  } catch (error: unknown) {
    console.error("Webhook Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
