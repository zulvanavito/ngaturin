import { getRecurringBills, getTransactions, getUser } from "@/lib/dal";
import { BillsClientView } from "./bills-client-view";
import { redirect } from "next/navigation";

export default async function BillsPage() {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const today = new Date();
  const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  // Fetch initial data at server level
  const [bills, transactions] = await Promise.all([
    getRecurringBills(),
    getTransactions({ type: "expense", month: monthStr })
  ]);

  return (
    <BillsClientView 
      initialBills={bills} 
      initialTransactions={transactions} 
    />
  );
}
