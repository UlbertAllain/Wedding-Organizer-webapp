import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET SINGLE VENDOR
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vendor = await prisma.vendor.findUnique({ where: { id } });
    if (!vendor) return NextResponse.json({ message: "Vendor tidak ditemukan" }, { status: 404 });
    return NextResponse.json(vendor);
  } catch (error) {
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}

// UPDATE VENDOR
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Akses ditolak!" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updatedVendor);
  } catch (error) {
    return NextResponse.json({ message: "Gagal update vendor" }, { status: 500 });
  }
}

// DELETE VENDOR (Soft Delete)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Akses ditolak!" }, { status: 403 });
    }

    const { id } = await params;
    const deletedVendor = await prisma.vendor.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json(deletedVendor);
  } catch (error) {
    return NextResponse.json({ message: "Gagal menghapus vendor" }, { status: 500 });
  }
}