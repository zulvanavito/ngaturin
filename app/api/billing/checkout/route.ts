import { createClient } from "@/lib/supabase/server";
import { snap } from "@/lib/midtrans";
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

    const { planId, interval } = await request.json();

    if (!PRICING[planId as keyof typeof PRICING]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const amount = PRICING[planId as keyof typeof PRICING][interval as 'monthly' | 'yearly'];
    const orderId = `SUBS-${planId.toUpperCase()}-${nanoid(8)}`;

    const parameter = {
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

    const transaction = await snap.createTransaction(parameter);

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
        snap_token: transaction.token,
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: "Failed to save transaction" }, { status: 500 });
    }

    return NextResponse.json({ 
      token: transaction.token,
      orderId: orderId 
    });

  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
