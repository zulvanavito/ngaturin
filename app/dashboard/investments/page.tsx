import { getInvestments, getInvestmentHistory, getUser } from "@/lib/dal";
import { InvestmentsClientView } from "./investments-client-view";
import { redirect } from "next/navigation";

export default async function InvestmentsPage() {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  // Fetch initial data at server level
  const [investments, history] = await Promise.all([
    getInvestments(),
    getInvestmentHistory()
  ]);

  const parsedInvestments = investments.map((item: any) => ({
    ...item,
    total_invested: Number(item.total_invested || 0),
    current_value: Number(item.current_value || 0),
  }));

  return (
    <InvestmentsClientView 
      initialInvestments={parsedInvestments} 
      initialHistory={history} 
    />
  );
}
