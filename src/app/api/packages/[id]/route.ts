import { safeDeleteCloudinaryAsset } from "@/lib/cloudinary/server";
import { assertCloudinaryAsset } from "@/lib/cloudinary/validation";
import { getPackage, deletePackage, updatePackage } from "@/features/packages/repository";
import { packageUpdateSchema } from "@/features/packages/schema";
import { requireAdmin } from "@/lib/auth/server";
import { assertSameOrigin, apiError, apiSuccess, handleApiError } from "@/lib/http";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const { id } = await context.params;
    const current = await getPackage(id);
    if (!current) return apiError("Package not found", 404);
    const input = packageUpdateSchema.parse(await request.json());
    if ("imageUrl" in input || "imagePublicId" in input) assertCloudinaryAsset(input.imageUrl, input.imagePublicId, "packages");
    await updatePackage(id, input);
    if ("imagePublicId" in input && input.imagePublicId !== current.imagePublicId) {
      await safeDeleteCloudinaryAsset(current.imagePublicId);
    }
    return apiSuccess({ id });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const { id } = await context.params;
    const current = await getPackage(id);
    if (!current) return apiError("Package not found", 404);
    await deletePackage(id);
    await safeDeleteCloudinaryAsset(current.imagePublicId);
    return apiSuccess({ id });
  } catch (error) {
    return handleApiError(error);
  }
}
