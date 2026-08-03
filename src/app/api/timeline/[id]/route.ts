import { getBooking } from "@/features/bookings/repository";
import { deleteTimeline, updateTimeline } from "@/features/timeline/repository";
import { timelineUpdateSchema } from "@/features/timeline/schema";
import { requireAdmin } from "@/lib/auth/server";
import { assertSameOrigin, apiError, apiSuccess, handleApiError } from "@/lib/http";

interface Context { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const admin = await requireAdmin();
    const { id } = await context.params;
    const input = timelineUpdateSchema.parse(await request.json());
    if (!(await getBooking(input.bookingId, admin))) return apiError("Booking not found", 404);
    await updateTimeline(id, input);
    return apiSuccess({ id });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const admin = await requireAdmin();
    const { id } = await context.params;
    const bookingId = new URL(request.url).searchParams.get("bookingId");
    if (!bookingId) return apiError("bookingId is required", 400);
    if (!(await getBooking(bookingId, admin))) return apiError("Booking not found", 404);
    await deleteTimeline(bookingId, id);
    return apiSuccess({ id });
  } catch (error) {
    return handleApiError(error);
  }
}
