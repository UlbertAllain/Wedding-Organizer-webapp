import { getBooking } from "@/features/bookings/repository";
import { createTimeline, listTimeline } from "@/features/timeline/repository";
import { timelineCreateSchema } from "@/features/timeline/schema";
import { requireAdmin, requireUser } from "@/lib/auth/server";
import { assertSameOrigin, apiError, apiSuccess, handleApiError } from "@/lib/http";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const bookingId = new URL(request.url).searchParams.get("bookingId");
    if (!bookingId) return apiError("bookingId is required", 400);
    if (!(await getBooking(bookingId, user))) return apiError("Booking not found", 404);
    return apiSuccess(await listTimeline(bookingId));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const admin = await requireAdmin();
    const input = timelineCreateSchema.parse(await request.json());
    if (!(await getBooking(input.bookingId, admin))) return apiError("Booking not found", 404);
    return apiSuccess({ id: await createTimeline(input) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
