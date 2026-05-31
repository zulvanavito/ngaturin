import { getTransactions } from "@/lib/dal";
import { TransactionsClientView } from "./transactions-client-view";
import type { Transaction } from "@/types/finance";

export default async function TransactionsPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  
  // Fetch initial data at server level
  const transactions = await getTransactions();

  return (
    <TransactionsClientView 
      initialTransactions={transactions as Transaction[]} 
      initialQuery={q} 
    />
  );
}
