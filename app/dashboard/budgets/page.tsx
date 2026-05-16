import { getBudgets, getTransactions, getUser } from "@/lib/dal";
import { BudgetsClientView } from "./budgets-client-view";
import { Budget } from "@/components/budgets/budget-card";
import { redirect } from "next/navigation";

export default async function BudgetsPage() {
  // Ensure user is authenticated and mark route as dynamic
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const currentMonth = new Date().toISOString().substring(0, 7);
  
  // Parallel fetch at server level
  const [budgets, transactions] = await Promise.all([
    getBudgets(),
    getTransactions({ type: "expense", month: currentMonth })
  ]);

  return (
    <BudgetsClientView 
      initialBudgets={budgets as Budget[]} 
      initialTransactions={transactions} 
    />
  );
}
