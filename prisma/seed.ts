import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Buat Akun Admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@wedding.com" },
    update: {},
    create: {
      email: "admin@wedding.com",
      name: "Admin WO",
      password: adminPassword,
      role: "ADMIN",
      phone: "081234567890",
    },
  });
  console.log("Admin created:", admin.email);

  // 2. Buat Akun User Dummy
  const userPassword = await bcrypt.hash("user123", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@test.com" },
    update: {},
    create: {
      email: "user@test.com",
      name: "Budi & Santi",
      password: userPassword,
      role: "USER",
      phone: "089876543210",
    },
  });
  console.log("User created:", user.email);

  // 3. Buat Paket Pernikahan
  await prisma.package.createMany({
    data: [
      {
        name: "Paket Silver",
        description: "Paket pernikahan intimate untuk perayaan kecil bersama kerabat terdekat.",
        price: 25000000,
        features: '["Dekorasi Standar", "Katering 100 Pax", "Dokumentasi Foto", "MC"]',
        isActive: true,
      },
      {
        name: "Paket Gold",
        description: "Paket pernikahan mewah dengan dekorasi premium dan hiburan lengkap.",
        price: 50000000,
        features: '["Dekorasi Premium", "Katering 500 Pax", "Dokumentasi Foto & Video (Cinematic)", "Entertainment (Band)", "Wedding Organizer"]',
        isActive: true,
      },
      {
        name: "Paket Platinum",
        description: "Paket eksklusif all-inclusive untuk pernikahan impian tanpa batas.",
        price: 100000000,
        features: '["Dekorasi Ultra Premium (Custom)", "Katering 1000 Pax", "Dokumentasi Foto & Video (Cinematic + Drone)", "Entertainment (Artist)", "Make Up Artist", "Wedding Organizer 24/7"]',
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });
  console.log("Packages created!");

  console.log("Seeding finished!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });