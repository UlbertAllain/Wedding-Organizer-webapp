import type { BookingStatus } from "@/types/domain";

export const BOOKING_TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  PENDING: ["CONFIRMED", "REJECTED", "CANCELLED"],
  CONFIRMED: ["REJECTED", "CANCELLED"],
  REJECTED: ["PENDING"],
  PAID: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: ["PENDING"],
};
