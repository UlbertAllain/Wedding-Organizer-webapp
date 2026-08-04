"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  Clock3,
  CreditCard,
  Images,
  LayoutGrid,
  Menu,
  MessageSquare,
  Package,
  Store,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";

import LogoutButton from "@/components/dashboard/LogoutButton";
import type { UserProfile } from "@/types/domain";

interface DashboardShellProps {
  user: UserProfile;
  children: React.ReactNode;
}

interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const pageTitles: Record<string, { title: string; note: string }> = {
  "/dashboard": {
    title: "Ringkasan",
    note: "Prioritas, acara, dan aktivitas terbaru.",
  },
  "/dashboard/bookings": {
    title: "Booking",
    note: "Jadwal, pasangan, paket, dan status acara.",
  },
  "/dashboard/timeline": {
    title: "Timeline",
    note: "Agenda persiapan dan pelaksanaan per acara.",
  },
  "/dashboard/packages": {
    title: "Paket",
    note: "Kelola cakupan layanan yang ditawarkan.",
  },
  "/dashboard/vendors": {
    title: "Vendor",
    note: "Daftar partner dan biaya layanan.",
  },
  "/dashboard/payments": {
    title: "Pembayaran",
    note: "Tagihan, bukti transfer, dan status pelunasan.",
  },
  "/dashboard/gallery": {
    title: "Galeri",
    note: "Dokumentasi umum dan koleksi setiap acara.",
  },
  "/dashboard/chat": {
    title: "Percakapan",
    note: "Komunikasi yang terhubung langsung ke booking.",
  },
  "/dashboard/profile": {
    title: "Profil",
    note: "Identitas dan informasi kontak akun.",
  },
};

const primaryLinks: NavigationItem[] = [
  { href: "/dashboard", label: "Ringkasan", icon: LayoutGrid },
  { href: "/dashboard/bookings", label: "Booking", icon: CalendarDays },
  { href: "/dashboard/timeline", label: "Timeline", icon: Clock3 },
  { href: "/dashboard/payments", label: "Pembayaran", icon: CreditCard },
  { href: "/dashboard/gallery", label: "Galeri", icon: Images },
  { href: "/dashboard/chat", label: "Percakapan", icon: MessageSquare },
];

const adminLinks: NavigationItem[] = [
  { href: "/dashboard/packages", label: "Paket", icon: Package },
  { href: "/dashboard/vendors", label: "Vendor", icon: Store },
];

export default function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dateLabel] = useState(() =>
    new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(new Date()),
  );

  const currentPage = pageTitles[pathname] ?? {
    title: "Dashboard",
    note: "Kelola operasional acara.",
  };

  function renderLink({ href, label, icon: Icon }: NavigationItem) {
    const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);

    return (
      <Link
        className={`dashboard-nav-link${active ? " active" : ""}`}
        href={href}
        key={href}
        aria-current={active ? "page" : undefined}
        onClick={() => setMobileOpen(false)}
      >
        <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <div className="dashboard-shell">
      {mobileOpen && (
        <button
          className="dashboard-backdrop"
          type="button"
          aria-label="Tutup navigasi"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`dashboard-sidebar${mobileOpen ? " mobile-open" : ""}`}>
        <div className="dashboard-sidebar-head">
          <Link href="/" className="dashboard-wordmark" onClick={() => setMobileOpen(false)}>
            <strong>Wedding</strong>
            <span>Organizer</span>
          </Link>
          <button
            className="dashboard-sidebar-close"
            type="button"
            aria-label="Tutup navigasi"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="dashboard-nav-group">
          <p>Workspace</p>
          <nav aria-label="Navigasi workspace">{primaryLinks.map(renderLink)}</nav>
        </div>

        {user.role === "ADMIN" && (
          <div className="dashboard-nav-group">
            <p>Master data</p>
            <nav aria-label="Navigasi master data">{adminLinks.map(renderLink)}</nav>
          </div>
        )}

        <div className="dashboard-sidebar-account">
          <Link href="/dashboard/profile" className="dashboard-account-link">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt={user.name} />
            ) : (
              <span className="dashboard-account-avatar">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
            )}
            <span>
              <strong>{user.name}</strong>
              <small>{user.role === "ADMIN" ? "Administrator" : "Klien"}</small>
            </span>
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <div className="dashboard-content">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-title">
            <button
              className="dashboard-menu-button"
              type="button"
              aria-label="Buka navigasi"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h1>{currentPage.title}</h1>
              <p>{currentPage.note}</p>
            </div>
          </div>

          <div className="dashboard-topbar-meta">
            <span>{dateLabel}</span>
            <Link href="/dashboard/profile" aria-label="Buka profil">
              <UserRound size={18} aria-hidden="true" />
            </Link>
          </div>
        </header>

        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}
