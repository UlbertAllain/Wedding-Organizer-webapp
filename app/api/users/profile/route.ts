import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

// UPDATE PROFILE
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { name, email, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    // Kalau mau ganti password, cek dulu password lamanya
    if (currentPassword && newPassword) {
      const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordCorrect) {
        return NextResponse.json({ message: "Password lama salah!" }, { status: 400 });
      }
      
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });
    }

    // Update nama & email
    await prisma.user.update({
      where: { id: userId },
      data: { 
        name: name || user.name, 
        email: email || user.email 
      },
    });

    return NextResponse.json({ message: "Profil berhasil diperbarui" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal update profil" }, { status: 500 });
  }
}