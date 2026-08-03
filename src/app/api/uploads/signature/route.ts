import { z } from "zod";

import { requireUser } from "@/lib/auth/server";
import { createUploadSignature } from "@/lib/cloudinary/server";
import { AppError } from "@/lib/errors";
import { assertSameOrigin, apiSuccess, handleApiError } from "@/lib/http";

const schema = z.object({
  folder: z.enum(["packages", "vendors", "gallery", "payments", "avatars"]),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const { folder } = schema.parse(await request.json());
    if (["packages", "vendors", "gallery"].includes(folder) && user.role !== "ADMIN") {
      throw new AppError("Only admins can upload this media type", 403);
    }
    return apiSuccess(createUploadSignature(folder));
  } catch (error) {
    return handleApiError(error);
  }
}
