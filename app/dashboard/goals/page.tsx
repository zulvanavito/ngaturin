import { getGoals, getUser } from "@/lib/dal";
import { GoalsClientView } from "./goals-client-view";
import { redirect } from "next/navigation";
import { Goal } from "@/components/goals/goal-card";

export default async function GoalsPage() {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const goals = await getGoals();

  return <GoalsClientView initialGoals={goals as Goal[]} />;
}
