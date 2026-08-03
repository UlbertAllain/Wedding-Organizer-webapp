import { z } from "zod";

export const timelineCreateSchema = z.object({
  bookingId: z.string().trim().min(1),
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000).nullable().optional(),
  eventTime: z.string().datetime(),
});

export const timelineUpdateSchema = z.object({
  bookingId: z.string().trim().min(1),
  title: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  eventTime: z.string().datetime().optional(),
  isCompleted: z.boolean().optional(),
});

export type TimelineCreateInput = z.infer<typeof timelineCreateSchema>;
export type TimelineUpdateInput = z.infer<typeof timelineUpdateSchema>;
