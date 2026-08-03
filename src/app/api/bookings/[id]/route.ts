import { getBooking, updateBookingStatus } from "@/features/bookings/repository";
import { bookingStatusSchema } from "@/features/bookings/schema";
import { requireUser } from "@/lib/auth/server";
import { assertSameOrigin, apiError, apiSuccess, handleApiError } from "@/lib/http";

interface Context { params: Promise<{ id: string }> }

export async function GET(_: Request, context: Context) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const record = await getBooking(id, user);
    return record ? apiSuccess(record) : apiError("Booking not found", 404);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const { id } = await context.params;
    const { status } = bookingStatusSchema.parse(await request.json());
    await updateBookingStatus(id, status, user);
    return apiSuccess({ id, status });
  } catch (error) {
    return handleApiError(error);
  }
}
