import { z } from "zod";
import { updatePaymentStatus } from "@/features/payments/repository";
import { requireAdmin } from "@/lib/auth/server";
import { assertSameOrigin, apiSuccess, handleApiError } from "@/lib/http";

const schema = z.object({ status: z.enum(["PAID", "FAILED", "REFUNDED"]) });
interface Context { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const { id } = await context.params;
    const { status } = schema.parse(await request.json());
    await updatePaymentStatus(id, status);
    return apiSuccess({ id, status });
  } catch (error) {
    return handleApiError(error);
  }
}
