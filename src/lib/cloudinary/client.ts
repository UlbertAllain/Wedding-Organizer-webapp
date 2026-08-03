import { apiRequest } from "@/lib/api-client";

interface SignatureResponse {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
}

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

export async function uploadImage(
  file: File,
  folder: "packages" | "vendors" | "gallery" | "payments" | "avatars",
) {
  if (!file.type.startsWith("image/")) throw new Error("File must be an image");
  if (file.size > 8 * 1024 * 1024) throw new Error("Maximum image size is 8 MB");

  const signature = await apiRequest<SignatureResponse>("/api/uploads/signature", {
    method: "POST",
    body: JSON.stringify({ folder }),
  });

  const formData = new FormData();
  formData.set("file", file);
  formData.set("api_key", signature.apiKey);
  formData.set("timestamp", String(signature.timestamp));
  formData.set("signature", signature.signature);
  formData.set("folder", signature.folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    { method: "POST", body: formData },
  );
  const body = (await response.json()) as CloudinaryResponse & { error?: { message: string } };
  if (!response.ok) throw new Error(body.error?.message ?? "Cloudinary upload failed");
  return { imageUrl: body.secure_url, imagePublicId: body.public_id };
}
