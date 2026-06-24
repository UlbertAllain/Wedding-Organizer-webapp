"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarCheck, Wallet, MessageSquare, UserCircle, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const userLinks = [
  { href: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/user/bookings", label: "My Bookings", icon: CalendarCheck },
  { href: "/user/payments", label: "Payments", icon: Wallet },
  { href: "/user/chat", label: "Chat", icon: MessageSquare },
  { href: "/user/profile", label: "Profile", icon: UserCircle },
];

export default function UserSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white text-dark-900 min-h-screen flex flex-col border-r border-gray-200 shadow-sm">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-gray-100">
        <Link href="/user/dashboard" className="font-serif text-2xl font-bold">
          Eternal<span className="text-gold-500">Vows</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {userLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-all duration-200 ${
                isActive
                  ? "bg-gold-400/10 text-gold-600 font-semibold border-l-4 border-gold-400"
                  : "text-gray-600 hover:bg-gray-50 hover:text-dark-900 border-l-4 border-transparent"
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-6 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-sm text-sm transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}