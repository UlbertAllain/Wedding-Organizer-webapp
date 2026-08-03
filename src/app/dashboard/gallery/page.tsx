import GalleryManager from "@/components/dashboard/GalleryManager";
import { requireUser } from "@/lib/auth/server";

export default async function GalleryPage() {
  const user = await requireUser();
  return <GalleryManager role={user.role} />;
}
