import BookingManager from "@/components/dashboard/BookingManager";
import { requireUser } from "@/lib/auth/server";

export default async function BookingPage() {
  const user = await requireUser();
  return <BookingManager role={user.role} />;
}
