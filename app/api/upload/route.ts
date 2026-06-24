import { NextResponse } from "next/server";
import formidable from "formidable";
import { promises as fs } from "fs";
import path from "path";

// Nonaktifkan body parser default Next.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "File tidak ditemukan" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = Date.now() + "_" + file.name.replace(/\s/g, "_");

    // Pastikan folder uploads ada
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Simpan file ke public/uploads
    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, buffer);

    // Return URL yang bisa diakses di frontend
    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Gagal mengupload file" }, { status: 500 });
  }
}