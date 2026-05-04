import { createClient } from "@/lib/supabase/server";
import { coreApi } from "@/lib/midtrans";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

const PRICING = {
  plus: {
    monthly: 15000,
    yearly: 144000,
  },
  pro: {
    monthly: 29000,
    yearly: 278400,
  },
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId, interval, payment_type, bank } = await request.json();

    if (!PRICING[planId as keyof typeof PRICING]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const amount = PRICING[planId as keyof typeof PRICING][interval as 'monthly' | 'yearly'];
    const orderId = `SUBS-${planId.toUpperCase()}-${nanoid(8)}`;

    const parameter: any = {
      payment_type: payment_type,
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        email: user.email,
        first_name: user.user_metadata?.name || user.email?.split('@')[0],
      },
      item_details: [
        {
          id: planId,
          price: amount,
          quantity: 1,
          name: `Ngaturin ${planId.toUpperCase()} (${interval === 'monthly' ? 'Bulanan' : 'Tahunan'})`,
        },
      ],
    };

    if (payment_type === 'bank_transfer') {
      parameter.bank_transfer = { bank: bank };
    }

    const transaction = await coreApi.charge(parameter);

    // Clean up any existing pending transactions for this user to prevent clutter
    await supabase
      .from("subscriptions")
      .delete()
      .eq("user_id", user.id)
      .eq("status", "pending");

    // Save pending subscription to DB
    const { error: dbError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_id: planId,
        status: "pending",
        amount: amount,
        interval: interval,
        midtrans_order_id: orderId,
        payment_type: payment_type,
        payment_details: transaction // Save the full response here (VA numbers, actions array, etc)
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: "Failed to save transaction" }, { status: 500 });
    }

    return NextResponse.json({ 
      orderId: orderId 
    });

  } catch (error: unknown) {
    console.error("Checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
