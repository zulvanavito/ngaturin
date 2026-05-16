import { getTransactions, getUser } from "@/lib/dal";
import { InsightsClientView } from "./insights-client-view";
import { redirect } from "next/navigation";
import { Transaction } from "@/components/finance/transaction-form";

export default async function InsightsPage() {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  // Fetch initial data at server level
  const transactions = await getTransactions();

  return <InsightsClientView initialTransactions={transactions as Transaction[]} />;
}
