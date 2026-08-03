import TimelineManager from "@/components/dashboard/TimelineManager";
import { requireUser } from "@/lib/auth/server";

export default async function TimelinePage() {
  const user = await requireUser();
  return <TimelineManager role={user.role} />;
}
