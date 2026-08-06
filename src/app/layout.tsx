import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Wedding Organizer — We Plan, You Celebrate",
    template: "%s | Wedding Organizer",
  },
  description:
    "Perencanaan, styling, dan koordinasi pernikahan yang personal, elegan, dan tertata dari awal hingga hari perayaan.",
};

export const viewport: Viewport = {
  themeColor: "#5b3039",
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
