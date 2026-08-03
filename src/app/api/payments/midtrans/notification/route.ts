import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";

import { updatePaymentStatus } from "@/features/payments/repository";
import { getServerEnv } from "@/lib/env";
import { getAdminDb } from "@/lib/firebase/admin";
import { apiError, apiSuccess, handleApiError } from "@/lib/http";
import type { PaymentStatus } from "@/types/domain";

const notificationSchema = z.object({
  order_id: z.string().min(1),
  status_code: z.string().min(1),
  gross_amount: z.string().min(1),
  signature_key: z.string().min(1),
  transaction_status: z.string().min(1),
  fraud_status: z.string().optional(),
});

function safeEqual(expected: string, received: string) {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

function mapStatus(transactionStatus: string, fraudStatus?: string): PaymentStatus {
  if (transactionStatus === "capture") return fraudStatus === "accept" ? "PAID" : "PENDING";
  if (transactionStatus === "settlement") return "PAID";
  if (["cancel", "deny", "expire"].includes(transactionStatus)) return "FAILED";
  if (transactionStatus === "refund") return "REFUNDED";
  return "PENDING";
}

export async function POST(request: Request) {
  try {
    const body = notificationSchema.parse(await request.json());
    const env = getServerEnv();
    if (!env.MIDTRANS_SERVER_KEY) return apiError("Midtrans is not configured", 503);

    const expected = createHash("sha512")
      .update(`${body.order_id}${body.status_code}${body.gross_amount}${env.MIDTRANS_SERVER_KEY}`)
      .digest("hex");

    if (!safeEqual(expected, body.signature_key)) {
      return apiError("Invalid Midtrans signature", 401);
    }

    const paymentQuery = await getAdminDb()
      .collection("payments")
      .where("orderId", "==", body.order_id)
      .limit(1)
      .get();
    const payment = paymentQuery.docs[0];
    if (!payment) return apiError("Payment not found", 404);
    const expectedAmount = Number(payment.data()?.amount ?? 0);
    if (Number(body.gross_amount) !== expectedAmount) {
      return apiError("Midtrans amount mismatch", 409);
    }

    const status = mapStatus(body.transaction_status, body.fraud_status);
    await updatePaymentStatus(payment.id, status, { ignoreStaleTransition: true });
    return apiSuccess({ received: true });
  } catch (error) {
    return handleApiError(error);
  }
}
