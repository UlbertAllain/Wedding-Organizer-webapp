import ProfileManager from "@/components/dashboard/ProfileManager";
import { requireUser } from "@/lib/auth/server";

export default async function ProfilePage() {
  const user = await requireUser();
  return <ProfileManager user={user} />;
}
