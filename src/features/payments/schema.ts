import { z } from "zod";

export const paymentCreateSchema = z.object({
  bookingId: z.string().trim().min(1),
});

export const manualPaymentSchema = z.object({
  bookingId: z.string().trim().min(1),
  proofUrl: z.string().url(),
  proofPublicId: z.string().trim().min(1),
});
