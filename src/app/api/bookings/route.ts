import { bookingCreateSchema } from "@/features/bookings/schema";
import { createBooking, listBookings } from "@/features/bookings/repository";
import { requireRole, requireUser } from "@/lib/auth/server";
import { assertSameOrigin, apiSuccess, handleApiError } from "@/lib/http";

export async function GET() {
  try {
    const user = await requireUser();
    return apiSuccess(await listBookings(user));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireRole("USER");
    const input = bookingCreateSchema.parse(await request.json());
    const id = await createBooking(user, input);
    return apiSuccess({ id }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
