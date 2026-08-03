import { z } from "zod";

export const bookingCreateSchema = z.object({
  packageId: z.string().trim().min(1),
  weddingDate: z.string().datetime(),
  venue: z.string().trim().min(2).max(150),
  venueAddress: z.string().trim().min(5).max(500),
  theme: z.string().trim().max(120).nullable().optional(),
  guestCount: z.coerce.number().int().positive().max(100000),
  groomName: z.string().trim().min(2).max(100),
  brideName: z.string().trim().min(2).max(100),
  groomPhone: z.string().trim().min(8).max(30),
  bridePhone: z.string().trim().min(8).max(30),
  ceremonyType: z.string().trim().min(2).max(100),
  notes: z.string().trim().max(2000).nullable().optional(),
  selectedVendorIds: z
    .array(z.string().trim().min(1))
    .max(30)
    .default([])
    .transform((ids) => [...new Set(ids)]),
});

export const bookingStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "REJECTED",
    "PAID",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ]),
});

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;
