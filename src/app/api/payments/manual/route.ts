import { getBooking } from "@/features/bookings/repository";
import { manualPaymentSchema } from "@/features/payments/schema";
import { upsertPayment } from "@/features/payments/repository";
import { safeDeleteCloudinaryAsset } from "@/lib/cloudinary/server";
import { assertCloudinaryAsset } from "@/lib/cloudinary/validation";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireRole } from "@/lib/auth/server";
import { assertSameOrigin, apiError, apiSuccess, handleApiError } from "@/lib/http";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireRole("USER");
    const input = manualPaymentSchema.parse(await request.json());
    assertCloudinaryAsset(input.proofUrl, input.proofPublicId, "payments");
    const booking = await getBooking(input.bookingId, user);
    if (!booking) return apiError("Booking not found", 404);
    if (booking.status !== "CONFIRMED") return apiError("Booking must be confirmed before payment", 409);

    const documentId = `MANUAL-${booking.id}`;
    const previous = await getAdminDb().collection("payments").doc(documentId).get();
    const previousProof = previous.data()?.proofPublicId ? String(previous.data()?.proofPublicId) : null;
    const id = await upsertPayment({
      bookingId: booking.id,
      userId: booking.userId,
      userName: booking.userName,
      amount: booking.totalPrice,
      provider: "MANUAL",
      status: "PENDING",
      orderId: null,
      paymentUrl: null,
      proofUrl: input.proofUrl,
      proofPublicId: input.proofPublicId,
      paidAt: null,
    }, documentId);
    if (previousProof && previousProof !== input.proofPublicId) {
      await safeDeleteCloudinaryAsset(previousProof);
    }
    return apiSuccess({ id }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
