import { getPublicEnv, getServerEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";

type MediaFolder = "packages" | "vendors" | "gallery" | "payments" | "avatars";

export function assertCloudinaryAsset(
  imageUrl: string | null | undefined,
  publicId: string | null | undefined,
  folder: MediaFolder,
) {
  if (!imageUrl && !publicId) return;
  if (!imageUrl || !publicId) {
    throw new AppError("Cloudinary URL and public ID must be supplied together", 400);
  }

  const serverEnv = getServerEnv();
  const publicEnv = getPublicEnv();
  const baseFolder = serverEnv.CLOUDINARY_UPLOAD_FOLDER.replace(/^\/+|\/+$/g, "");
  const expectedPrefix = `${baseFolder}/${folder}/`;
  if (!publicId.startsWith(expectedPrefix)) {
    throw new AppError("Invalid Cloudinary asset folder", 400);
  }

  let parsed: URL;
  try {
    parsed = new URL(imageUrl);
  } catch {
    throw new AppError("Invalid Cloudinary URL", 400);
  }
  const cloudPath = `/${publicEnv.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/`;
  if (parsed.protocol !== "https:" || parsed.hostname !== "res.cloudinary.com" || !parsed.pathname.startsWith(cloudPath)) {
    throw new AppError("Invalid Cloudinary asset URL", 400);
  }
}
