import { getUser, getTransactions, getBudgets, getCategories, getWallets, getRecurringBills, getDebts, getInvestments, getGoals } from "@/lib/dal";
import { getReportEntitlements } from "@/lib/reports/report-entitlements";
import { redirect } from "next/navigation";
import { ReportsClientView } from "./reports-client-view";
import type { Transaction, Budget, Category, Wallet, Debt, RecurringBill, Investment, Goal } from "@/types/finance";

export const metadata = {
  title: "Laporan Keuangan | Ngaturin",
  description: "Laporan analisis keuangan Ngaturin",
};

export default async function ReportsPage() {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  // Parallel data fetching for performance
    const [
    transactions, 
    budgets, 
    categories, 
    wallets, 
    bills, 
    debts, 
    goals,
    investments,
    entitlements
  ] = await Promise.all([
    getTransactions(),
    getBudgets("all"), 
    getCategories(),
    getWallets(),
    getRecurringBills(),
    getDebts(),
    getGoals(),
    getInvestments(),
    getReportEntitlements(),
  ]);

  return (
    <ReportsClientView 
      initialData={{
        transactions: transactions as Transaction[],
        budgets: budgets as Budget[],
        categories: categories as Category[],
        wallets: wallets as Wallet[],
        bills: bills as RecurringBill[],
        debts: debts as Debt[],
        goals: goals as Goal[],
        investments: investments as Investment[],
      }}
      entitlements={entitlements}
    />
  );
}
