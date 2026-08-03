import { z } from "zod";

export const chatMessageSchema = z.object({
  bookingId: z.string().trim().min(1),
  message: z.string().trim().min(1).max(2000),
});
