import PaymentManager from "@/components/dashboard/PaymentManager";
import { requireUser } from "@/lib/auth/server";

export default async function PaymentsPage() {
  const user = await requireUser();
  return <PaymentManager role={user.role} />;
}
