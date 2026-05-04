import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { InstructionClient } from "./instruction-client";

export default async function InstructionPage({
  params
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params;
  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("midtrans_order_id", orderId)
    .single();

  if (!subscription) {
    notFound();
  }

  // Jika sudah sukses, redirect ke finish
  if (subscription.status === "settlement" || subscription.status === "capture") {
    redirect("/payment/finish");
  }

  // Jika expire/cancel, redirect ke error
  if (subscription.status === "expire" || subscription.status === "cancel" || subscription.status === "deny") {
    redirect("/payment/error");
  }

  return <InstructionClient initialData={subscription} />;
}
