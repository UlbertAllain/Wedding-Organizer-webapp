import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pusher } from "@/lib/pusher";

// AMBIL PESAN LAMA
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) return NextResponse.json([], { status: 400 });

    const messages = await prisma.chatMessage.findMany({
      where: { bookingId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

// KIRIM PESAN BARU
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { bookingId, message } = await request.json();
    const userId = (session.user as any).id;

    // 1. Simpan ke Database
    const newMessage = await prisma.chatMessage.create({
      data: { bookingId, senderId: userId, message },
    });

    // 2. Trigger Pusher Event ke channel private-chat-bookingId
    await pusher.trigger(`private-chat-${bookingId}`, "new-message", {
      id: newMessage.id,
      senderId: userId,
      message: newMessage.message,
      createdAt: newMessage.createdAt,
      senderName: session.user?.name,
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengirim pesan" }, { status: 500 });
  }
}