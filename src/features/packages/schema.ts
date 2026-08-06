import { z } from "zod";

export const packageInputSchema = z.object({
  name: z.string().trim().min(3).max(100),
  description: z.string().trim().min(10).max(1500),
  price: z.coerce.number().int().positive(),
  features: z.array(z.string().trim().min(1).max(120)).min(1).max(30),
  imageUrl: z.string().url().nullable().optional(),
  imagePublicId: z.string().trim().nullable().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().optional(),
});

export const packageUpdateSchema = packageInputSchema.partial();
export type PackageInput = z.infer<typeof packageInputSchema>;
