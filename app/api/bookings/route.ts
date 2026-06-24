import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schema validasi untuk buat booking
const bookingSchema = z.object({
  packageId: z.string(),
  weddingDate: z.string().datetime(),
  venue: z.string().min(1, "Venue wajib diisi"),
  theme: z.string().optional(),
  guestCount: z.number().min(1, "Jumlah tamu minimal 1"),
  notes: z.string().optional(),
});

// GET ALL BOOKINGS
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    // Kalau Admin, ambil semua booking. Kalau User, ambil booking dia aja
    const whereCondition = role === "ADMIN" ? {} : { userId: userId };

    const bookings = await prisma.booking.findMany({
      where: whereCondition,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        package: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data booking" }, { status: 500 });
  }
}

// CREATE NEW BOOKING
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "USER") {
      return NextResponse.json({ message: "Hanya user yang bisa booking" }, { status: 403 });
    }

    const body = await request.json();
    const validation = bookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error?.issues?.[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const { packageId, weddingDate, venue, theme, guestCount, notes } = validation.data;
    const userId = (session.user as any).id;

    // Cek paketnya ada apa enggak
    const selectedPackage = await prisma.package.findUnique({
      where: { id: packageId },
    });

        // Cek paketnya ada apa enggak
    if (!selectedPackage || !selectedPackage.isActive) {
      return NextResponse.json({ message: "Paket tidak tersedia" }, { status: 404 });
    }

    // ==========================================
    // VALIDASI KUOTA HARIAN (Maksimal 3 per hari)
    // ==========================================
    const MAX_BOOKINGS_PER_DAY = 3;

    // Buat batas awal dan akhir hari (00:00:00 sampai 23:59:59)
    const startOfDay = new Date(weddingDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(weddingDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Hitung booking aktif di tanggal tersebut
    const activeBookingsCount = await prisma.booking.count({
      where: {
        weddingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["PENDING", "CONFIRMED", "PAID", "IN_PROGRESS"], // Hitung yang belum selesai/dibatalkan
        },
      },
    });

    if (activeBookingsCount >= MAX_BOOKINGS_PER_DAY) {
      return NextResponse.json(
        { message: "Maaf, jadwal di tanggal tersebut sudah penuh (maks 3 booking/hari). Silakan pilih tanggal lain." },
        { status: 400 }
      );
    }
  
    const newBooking = await prisma.booking.create({
      data: {
        userId,
        packageId,
        weddingDate: new Date(weddingDate),
        venue,
        theme: theme || null,
        guestCount,
        notes: notes || null,
        totalPrice: selectedPackage.price, // Harga diambil dari harga paket saat itu
      },
    });

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal membuat booking" }, { status: 500 });
  }
}