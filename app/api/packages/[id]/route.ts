import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET SINGLE PACKAGE
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pkg = await prisma.package.findUnique({ where: { id } });

    if (!pkg) {
      return NextResponse.json({ message: "Paket tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(pkg);
  } catch (error) {
    return NextResponse.json({ message: "Gagal mengambil data paket" }, { status: 500 });
  }
}

// UPDATE PACKAGE (ADMIN ONLY)
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
    
    const updatedPackage = await prisma.package.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updatedPackage);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal update paket" }, { status: 500 });
  }
}

// DELETE PACKAGE (SOFT DELETE - ADMIN ONLY)
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
    
    // Soft delete: matikan statusnya
    const deletedPackage = await prisma.package.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json(deletedPackage);
  } catch (error) {
    return NextResponse.json({ message: "Gagal menghapus paket" }, { status: 500 });
  }
}