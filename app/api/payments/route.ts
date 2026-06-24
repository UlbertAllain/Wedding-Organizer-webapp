import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import midtransClient from "midtrans-client";

// GET ALL PAYMENTS (ADMIN ONLY)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Akses ditolak!" }, { status: 403 });
    }

    const payments = await prisma.payment.findMany({
      include: {
        booking: {
          select: { id: true, package: { select: { name: true } } }
        },
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data pembayaran" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { bookingId } = await request.json();

    // Cek booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, package: true },
    });

    if (!booking || booking.status !== "CONFIRMED") {
      return NextResponse.json({ message: "Booking tidak valid atau belum di-approve" }, { status: 400 });
    }

         // Cek apakah Key ada
    if (!process.env.MIDTRANS_SERVER_KEY || !process.env.MIDTRANS_CLIENT_KEY) {
      return NextResponse.json({ message: "Midtrans Keys belum diatur di .env" }, { status: 500 });
    }

    // Inisialisasi Midtrans Snap
    const snap = new midtransClient.Snap({
      isProduction: false, // Sandbox mode
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY, // Tambahkan ini
    });

    const parameter = {
      transaction_details: {
        order_id: `WO-${booking.id}-${Date.now()}`, // ID unik
        gross_amount: booking.totalPrice,
      },
      customer_details: {
        first_name: booking.user.name,
        email: booking.user.email,
        phone: booking.user.phone || "",
      },
      item_details: [
        {
          id: booking.package.id,
          price: booking.totalPrice,
          quantity: 1,
          name: `Paket ${booking.package.name}`,
        },
      ],
    };

    // Minta token/URL ke Midtrans
    const transaction = await snap.createTransaction(parameter);

    // Simpan info pembayaran ke database
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        userId: booking.userId,
        amount: booking.totalPrice,
        midtransOrderId: parameter.transaction_details.order_id,
        midtransSnapUrl: transaction.redirect_url,
        status: "PENDING",
      },
    });

    return NextResponse.json({ snapUrl: transaction.redirect_url });
  } catch (error) {
    console.error("Midtrans Error:", error);
    return NextResponse.json({ message: "Gagal membuat transaksi pembayaran" }, { status: 500 });
  }
}