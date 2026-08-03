import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Wedding Organizer",
    template: "%s | Wedding Organizer",
  },
  description:
    "Booking dan operasional wedding organizer dalam satu sistem yang terstruktur.",
};

export const viewport: Viewport = {
  themeColor: "#221c18",
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
