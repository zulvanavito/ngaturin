import { getTransactions, getUser } from "@/lib/dal";
import { InsightsClientView } from "./insights-client-view";
import { redirect } from "next/navigation";
import type { Transaction } from "@/types/finance";

export default async function InsightsPage() {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  // Fetch initial data at server level
  const transactions = await getTransactions();

  return <InsightsClientView initialTransactions={transactions as Transaction[]} />;
}
