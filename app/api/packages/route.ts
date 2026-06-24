import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Pake instance yang udah ada
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// GET ALL PACKAGES (Public & Admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Kalau Admin, tampilkan semua paket. Kalau User/Tamu, cuma yang aktif
    const whereCondition = session?.user?.role === "ADMIN" ? {} : { isActive: true };

    const packages = await prisma.package.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(packages);
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal mengambil data paket" },
      { status: 500 }
    );
  }
}

// CREATE PACKAGE (ADMIN ONLY)
const packageSchema = z.object({
  name: z.string().min(1, "Nama paket wajib diisi"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  price: z.number().min(100000, "Harga minimal 100000"),
  features: z.string(), // Ini string JSON array, misal '["Dekorasi", "Katering"]'
  image: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    // Cek apakah yang akses adalah ADMIN
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Akses ditolak! Hanya Admin." }, { status: 403 });
    }

    const body = await request.json();
    const validation = packageSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error?.issues?.[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const newPackage = await prisma.package.create({
      data: validation.data,
    });

    return NextResponse.json(newPackage, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal membuat paket baru" },
      { status: 500 }
    );
  }
}