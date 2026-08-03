import { packageInputSchema } from "@/features/packages/schema";
import { createPackage, listPackages } from "@/features/packages/repository";
import { requireAdmin } from "@/lib/auth/server";
import { assertCloudinaryAsset } from "@/lib/cloudinary/validation";
import { assertSameOrigin, apiSuccess, handleApiError } from "@/lib/http";

export async function GET(request: Request) {
  try {
    const activeOnly = new URL(request.url).searchParams.get("active") === "true";
    if (!activeOnly) await requireAdmin();
    const response = apiSuccess(await listPackages({ activeOnly }));
    if (activeOnly) response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const input = packageInputSchema.parse(await request.json());
    assertCloudinaryAsset(input.imageUrl, input.imagePublicId, "packages");
    const id = await createPackage(input);
    return apiSuccess({ id }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
