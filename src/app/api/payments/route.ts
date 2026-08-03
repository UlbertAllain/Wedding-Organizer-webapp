import midtransClient from "midtrans-client";

import { getBooking } from "@/features/bookings/repository";
import {
  getPayment,
  listPayments,
  upsertPayment,
} from "@/features/payments/repository";
import { paymentCreateSchema } from "@/features/payments/schema";
import { requireRole, requireUser } from "@/lib/auth/server";
import { getServerEnv } from "@/lib/env";
import {
  assertSameOrigin,
  apiError,
  apiSuccess,
  handleApiError,
} from "@/lib/http";

export async function GET() {
  try {
    const user = await requireUser();
    return apiSuccess(await listPayments(user));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireRole("USER");
    const { bookingId } = paymentCreateSchema.parse(await request.json());
    const booking = await getBooking(bookingId, user);

    if (!booking) return apiError("Booking not found", 404);
    if (booking.status !== "CONFIRMED") {
      return apiError("Booking must be confirmed before payment", 409);
    }

    const paymentId = `MIDTRANS-${booking.id}`;
    const existing = await getPayment(paymentId);
    if (existing?.status === "PAID") {
      return apiError("Booking has already been paid", 409);
    }
    if (existing?.status === "PENDING" && existing.paymentUrl && existing.orderId) {
      return apiSuccess({
        orderId: existing.orderId,
        redirectUrl: existing.paymentUrl,
        reused: true,
      });
    }

    const env = getServerEnv();
    if (!env.MIDTRANS_SERVER_KEY) {
      return apiError("Midtrans is not configured", 503);
    }

    const orderId = `WO-${booking.id}-${Date.now()}`;
    const snap = new midtransClient.Snap({
      isProduction: env.MIDTRANS_IS_PRODUCTION,
      serverKey: env.MIDTRANS_SERVER_KEY,
    });

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: booking.totalPrice,
      },
      customer_details: {
        first_name: booking.userName,
        email: booking.userEmail,
      },
      item_details: [
        {
          id: booking.packageId,
          price: booking.totalPrice,
          quantity: 1,
          name: `${booking.packageName} + vendor`.slice(0, 50),
        },
      ],
      callbacks: {
        finish: `${env.NEXT_PUBLIC_APP_URL}/dashboard/payments`,
      },
    });

    await upsertPayment(
      {
        bookingId: booking.id,
        userId: booking.userId,
        userName: booking.userName,
        amount: booking.totalPrice,
        provider: "MIDTRANS",
        status: "PENDING",
        orderId,
        paymentUrl: transaction.redirect_url,
        proofUrl: null,
        proofPublicId: null,
        paidAt: null,
      },
      paymentId,
    );

    return apiSuccess(
      { orderId, redirectUrl: transaction.redirect_url, reused: false },
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
