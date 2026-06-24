import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET ALL GALLERY
export async function GET() {
  try {
    const galleries = await prisma.gallery.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(galleries);
  } catch (error) {
    return NextResponse.json({ message: "Gagal mengambil data galeri" }, { status: 500 });
  }
}

// CREATE GALLERY
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Akses ditolak!" }, { status: 403 });
    }

    const body = await request.json();
    const { image, caption, bookingId } = body;

    const newGallery = await prisma.gallery.create({
      data: {
        image,
        caption: caption || null,
        bookingId: bookingId || null,
        uploadedBy: "ADMIN",
      },
    });

    return NextResponse.json(newGallery, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Gagal menambah galeri" }, { status: 500 });
  }
}