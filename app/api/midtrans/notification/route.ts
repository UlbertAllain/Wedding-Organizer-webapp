import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const notificationJson = await request.json();

    const orderId = notificationJson.order_id;
    const statusCode = notificationJson.status_code;
    const grossAmount = notificationJson.gross_amount;
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const transactionStatus = notificationJson.transaction_status;
    const fraudStatus = notificationJson.fraud_status;

    if (!serverKey) {
      return NextResponse.json({ message: "Server key missing" }, { status: 500 });
    }

    // 1. Verifikasi Signature Key (Keamanan agar pasti request dari Midtrans)
    const signatureKey = crypto
      .createHash("sha512")
      .update(orderId + statusCode + grossAmount + serverKey)
      .digest("hex");

    if (signatureKey !== notificationJson.signature_key) {
      return NextResponse.json({ message: "Invalid Signature" }, { status: 403 });
    }

    // 2. Cari data pembayaran di database kita berdasarkan order_id
    const payment = await prisma.payment.findFirst({
      where: { midtransOrderId: orderId },
    });

    if (!payment) {
      return NextResponse.json({ message: "Payment not found" }, { status: 404 });
    }

    // 3. Tentukan status baru berdasarkan notifikasi Midtrans
    let newStatus = payment.status;
    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") newStatus = "PAID";
    } else if (transactionStatus === "settlement") {
      newStatus = "PAID";
    } else if (transactionStatus === "cancel" || transactionStatus === "deny" || transactionStatus === "expire") {
      newStatus = "FAILED";
    } else if (transactionStatus === "pending") {
      newStatus = "PENDING";
    }

    // 4. Update Database Kalau Status Berubah Jadi PAID
    if (newStatus === "PAID" && payment.status !== "PAID") {
      await prisma.$transaction([
        // Update status Payment
        prisma.payment.update({
          where: { id: payment.id },
          data: { 
            status: "PAID", 
            paidAt: new Date() 
          },
        }),
        // Update status Booking jadi PAID
        prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: "PAID" },
        }),
        // Kirim notifikasi ke User
        prisma.notification.create({
          data: {
            userId: payment.userId,
            title: "Pembayaran Berhasil! 🎉",
            message: "Pembayaran Anda telah dikonfirmasi. Tim kami akan segera menghubungi Anda untuk koordinasi selanjutnya.",
          },
        }),
      ]);
    }

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("Midtrans Webhook Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}