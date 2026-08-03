import { z } from "zod";

export const galleryCreateSchema = z.object({
  bookingId: z.string().trim().nullable().optional(),
  imageUrl: z.string().url(),
  imagePublicId: z.string().trim().min(1),
  caption: z.string().trim().max(300).nullable().optional(),
});
