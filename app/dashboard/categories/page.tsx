import { getCategories, getUser } from "@/lib/dal";
import { CategoriesClientView } from "./categories-client-view";
import { redirect } from "next/navigation";

export default async function CategoriesPage() {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const categories = await getCategories();

  return <CategoriesClientView initialCategories={categories} />;
}
