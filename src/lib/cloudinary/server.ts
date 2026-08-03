import { v2 as cloudinary } from "cloudinary";

import { getPublicEnv, getServerEnv } from "@/lib/env";

let configured = false;
function getCloudinary() {
  if (!configured) {
    const serverEnv = getServerEnv();
    const publicEnv = getPublicEnv();
    cloudinary.config({
      cloud_name: publicEnv.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: serverEnv.CLOUDINARY_API_KEY,
      api_secret: serverEnv.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

export function createUploadSignature(folderSuffix: string) {
  const serverEnv = getServerEnv();
  const publicEnv = getPublicEnv();
  const client = getCloudinary();
  const timestamp = Math.round(Date.now() / 1000);
  const baseFolder = serverEnv.CLOUDINARY_UPLOAD_FOLDER.replace(/^\/+|\/+$/g, "");
  const folder = `${baseFolder}/${folderSuffix}`;
  const signature = client.utils.api_sign_request(
    { folder, timestamp },
    serverEnv.CLOUDINARY_API_SECRET,
  );

  return {
    cloudName: publicEnv.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: serverEnv.CLOUDINARY_API_KEY,
    folder,
    timestamp,
    signature,
  };
}

export async function deleteCloudinaryAsset(publicId: string | null | undefined) {
  if (!publicId) return;
  await getCloudinary().uploader.destroy(publicId, { invalidate: true });
}

export async function safeDeleteCloudinaryAsset(publicId: string | null | undefined) {
  try {
    await deleteCloudinaryAsset(publicId);
  } catch (error) {
    console.error("Cloudinary cleanup failed", { publicId, error });
  }
}
