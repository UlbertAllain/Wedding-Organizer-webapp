import { z } from "zod";

export const vendorInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  category: z.string().trim().min(2).max(80),
  description: z.string().trim().max(1500).nullable().optional(),
  price: z.coerce.number().int().nonnegative().nullable().optional(),
  contact: z.string().trim().max(150).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  imagePublicId: z.string().trim().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const vendorUpdateSchema = vendorInputSchema.partial();
export type VendorInput = z.infer<typeof vendorInputSchema>;
