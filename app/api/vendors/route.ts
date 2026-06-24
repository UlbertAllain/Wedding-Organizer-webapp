import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// GET ALL VENDORS
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Akses ditolak!" }, { status: 403 });
    }

    const vendors = await prisma.vendor.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(vendors);
  } catch (error) {
    return NextResponse.json({ message: "Gagal mengambil data vendor" }, { status: 500 });
  }
}

// CREATE VENDOR
const vendorSchema = z.object({
  name: z.string().min(1, "Nama vendor wajib diisi"),
  category: z.string().min(1, "Kategori wajib diisi"),
  description: z.string().nullable().optional(), // Ubah jadi nullable
  price: z.number().nullable().optional(),       // Ubah jadi nullable
  contact: z.string().nullable().optional(),     // Ubah jadi nullable
  image: z.string().nullable().optional(),       // Ubah jadi nullable
  isActive: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Akses ditolak!" }, { status: 403 });
    }

    const body = await request.json();
    const validation = vendorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error?.issues?.[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const newVendor = await prisma.vendor.create({
      data: validation.data,
    });

    return NextResponse.json(newVendor, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Gagal membuat vendor baru" }, { status: 500 });
  }
}