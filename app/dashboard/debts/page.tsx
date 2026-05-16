import { getDebts, getUser } from "@/lib/dal";
import { DebtsClientView } from "./debts-client-view";
import { redirect } from "next/navigation";

export default async function DebtsPage() {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const debts = await getDebts();

  return <DebtsClientView initialDebts={debts} />;
}
