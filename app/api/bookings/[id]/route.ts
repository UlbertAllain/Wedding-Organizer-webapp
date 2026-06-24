import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET SINGLE BOOKING
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // <- Ubah jadi Promise
) {
  try {
    const { id } = await params; // <- Await params dulu

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        package: true,
        bookingDetails: true,
        payments: true,
        vendors: { include: { vendor: true } },
        timelines: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ message: "Booking tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}

// UPDATE STATUS BOOKING (ADMIN ONLY)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // <- Ubah jadi Promise
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Akses ditolak!" }, { status: 403 });
    }

    const { id } = await params; // <- Await params dulu
    const body = await request.json();
    const { status } = body;

    // Update status booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    // Buat notifikasi ke user kalau status berubah
    if (status && updatedBooking.userId) {
      await prisma.notification.create({
        data: {
          userId: updatedBooking.userId,
          title: "Status Booking Diperbarui",
          message: `Status booking Anda telah diubah menjadi ${status}`,
        },
      });
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal update booking" }, { status: 500 });
  }
}