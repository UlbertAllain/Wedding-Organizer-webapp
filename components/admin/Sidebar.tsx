"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, CalendarCheck, Users, Wallet, Image, MessageSquare, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/packages", label: "Packages", icon: Package },
  { href: "/admin/vendors", label: "Vendors", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: Wallet },
  { href: "/admin/gallery", label: "Gallery", icon: Image },
  { href: "/admin/chat", label: "Chat", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-dark-900 text-white min-h-screen flex flex-col border-r border-dark-800">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-dark-800">
        <Link href="/admin/dashboard" className="font-serif text-2xl font-bold">
          Eternal<span className="text-gold-400">Vows</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {adminLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-all duration-200 ${
                isActive
                  ? "bg-gold-400/10 text-gold-400 font-semibold"
                  : "text-gray-400 hover:bg-dark-800 hover:text-white"
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-6 border-t border-dark-800">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-400 hover:bg-dark-800 rounded-sm text-sm transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}