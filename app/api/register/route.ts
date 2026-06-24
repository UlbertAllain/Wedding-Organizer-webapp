import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema validasi pakai Zod
const registerSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validasi input
        // Validasi input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
    return NextResponse.json(
        { message: validation.error?.issues?.[0]?.message || "Input tidak valid" },
        { status: 400 }
    );
    }

    const { name, email, password, phone } = validation.data;

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru ke database (default role: USER)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: "USER", // Hardcode USER, admin hanya dibuat via seed
      },
    });

    // Jangan return password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: "Registrasi berhasil", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}