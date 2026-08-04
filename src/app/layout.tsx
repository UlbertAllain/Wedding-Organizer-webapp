import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Wedding Organizer",
    template: "%s | Wedding Organizer",
  },
  description:
    "Perencanaan, booking, pembayaran, timeline, dan koordinasi wedding organizer dalam satu ruang kerja.",
};

export const viewport: Viewport = {
  themeColor: "#17271f",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
