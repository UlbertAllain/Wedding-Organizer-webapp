import DashboardOverview from "@/components/dashboard/DashboardOverview";
import { requireUser } from "@/lib/auth/server";

export default async function DashboardPage() {
  const user = await requireUser();
  return <DashboardOverview user={user} />;
}
