// Copy this file into the OLD Prisma project root and run:
// npx tsx export-from-old-project.ts
//
// The export intentionally excludes User.password so bcrypt hashes are never
// written to the migration JSON.
import { writeFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
} as const;

try {
  const output = {
    users: await prisma.user.findMany({ select: publicUserSelect }),
    packages: await prisma.package.findMany(),
    vendors: await prisma.vendor.findMany(),
    bookings: await prisma.booking.findMany({
      include: {
        user: { select: publicUserSelect },
        package: true,
        bookingDetails: true,
        vendors: { include: { vendor: true } },
        timelines: true,
      },
    }),
    payments: await prisma.payment.findMany({
      include: {
        user: { select: publicUserSelect },
        booking: { include: { user: { select: publicUserSelect } } },
      },
    }),
    gallery: await prisma.gallery.findMany(),
    chatMessages: await prisma.chatMessage.findMany({
      include: { sender: { select: publicUserSelect } },
    }),
  };

  await writeFile("legacy-export.json", JSON.stringify(output, null, 2), {
    mode: 0o600,
  });
  console.log("Created legacy-export.json (password hashes excluded)");
} finally {
  await prisma.$disconnect();
}
