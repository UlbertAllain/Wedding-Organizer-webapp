import { redirect } from "next/navigation";

import CatalogManager from "@/components/dashboard/CatalogManager";
import { requireUser } from "@/lib/auth/server";

export default async function PackagesPage() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return <CatalogManager mode="packages" />;
}
