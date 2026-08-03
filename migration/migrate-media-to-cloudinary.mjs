import fs from "node:fs/promises";
import path from "node:path";

import { v2 as cloudinary } from "cloudinary";

const input = process.argv[2] ?? "migration/legacy-export.json";
const publicDir = process.argv[3] ?? "public";
const output =
  process.argv[4] ?? "migration/legacy-export-cloudinary.json";
const folder = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "wedding-organizer";

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function resolveSource(source) {
  if (/^https?:\/\//.test(source)) return source;
  return path.resolve(publicDir, String(source).replace(/^\//, ""));
}

cloudinary.config({
  cloud_name: requiredEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
  api_key: requiredEnv("CLOUDINARY_API_KEY"),
  api_secret: requiredEnv("CLOUDINARY_API_SECRET"),
  secure: true,
});

const data = JSON.parse(await fs.readFile(input, "utf8"));
const failures = [];

async function migrateImage(item, keys, suffix) {
  const source = keys.map((key) => item[key]).find(Boolean);
  if (!source) return;
  if (String(source).includes("res.cloudinary.com") && item.imagePublicId) return;

  try {
    const result = await cloudinary.uploader.upload(resolveSource(source), {
      folder: `${folder}/${suffix}`,
      resource_type: "image",
    });
    item.imageUrl = result.secure_url;
    item.imagePublicId = result.public_id;
  } catch (error) {
    failures.push({ source, message: error instanceof Error ? error.message : String(error) });
    console.warn(`Media skipped (${source}):`, error instanceof Error ? error.message : error);
  }
}

for (const item of data.users ?? []) {
  await migrateImage(item, ["imageUrl", "avatar", "image"], "avatars");
}
for (const item of data.packages ?? []) {
  await migrateImage(item, ["imageUrl", "image"], "packages");
}
for (const item of data.vendors ?? []) {
  await migrateImage(item, ["imageUrl", "image"], "vendors");
}
for (const item of data.gallery ?? []) {
  await migrateImage(item, ["imageUrl", "image", "url"], "gallery");
}

for (const item of data.payments ?? []) {
  const source = item.proofUrl ?? item.proofImage;
  if (!source) continue;
  if (String(source).includes("res.cloudinary.com") && item.proofPublicId) continue;

  try {
    const result = await cloudinary.uploader.upload(resolveSource(source), {
      folder: `${folder}/payments`,
      resource_type: "image",
    });
    item.proofUrl = result.secure_url;
    item.proofImage = result.secure_url;
    item.proofPublicId = result.public_id;
  } catch (error) {
    failures.push({ source, message: error instanceof Error ? error.message : String(error) });
    console.warn(
      `Payment proof skipped (${source}):`,
      error instanceof Error ? error.message : error,
    );
  }
}

await fs.writeFile(output, JSON.stringify(data, null, 2), { mode: 0o600 });

if (failures.length > 0) {
  const failurePath = `${output}.failures.json`;
  await fs.writeFile(failurePath, JSON.stringify(failures, null, 2), {
    mode: 0o600,
  });
  console.warn(`Media migration completed with ${failures.length} failure(s).`);
  console.warn(`Failure report: ${failurePath}`);
  process.exitCode = 1;
} else {
  console.log(`Cloudinary migration output: ${output}`);
}
