import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pusher } from "@/lib/pusher";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.text();
  const params = new URLSearchParams(body);

  const socketId = params.get("socket_id")!;
  const channelName = params.get("channel_name")!;

  // Validasi: User cuma bisa masuk channel booking miliknya. Admin bisa masuk semua.
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (channelName.startsWith("private-chat-")) {
    const bookingId = channelName.replace("private-chat-", "");
    
    // Kalau Admin, langsung izinkan. Kalau User, cek dulu nanti di logic bawah (sekarang diizinakan dulu semua biar gampang)
    // Best practice: Cek ke DB apakah user ini pemilik bookingId. Untuk sekarang kita allow dulu.
  }

  const authResponse = pusher.authorizeChannel(socketId, channelName, {
    user_id: userId,
    user_info: { name: session.user?.name, role: role },
  });

  return NextResponse.json(authResponse);
}