"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarCheck,
  ChevronRight,
  Clock3,
  CreditCard,
  Images,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Package,
  PanelLeftClose,
  Sparkles,
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
  description: string;
  icon: LucideIcon;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/bookings": "Booking",
  "/dashboard/timeline": "Timeline",
  "/dashboard/packages": "Paket",
  "/dashboard/vendors": "Vendor",
  "/dashboard/payments": "Pembayaran",
  "/dashboard/gallery": "Galeri",
  "/dashboard/chat": "Chat",
  "/dashboard/profile": "Profil",
};

export default function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const adminLinks: NavigationItem[] = [
    {
      href: "/dashboard/packages",
      label: "Paket",
      description: "Katalog layanan",
      icon: Package,
    },
    {
      href: "/dashboard/vendors",
      label: "Vendor",
      description: "Partner acara",
      icon: Store,
    },
  ];
  const links: NavigationItem[] = [
    {
      href: "/dashboard",
      label: "Overview",
      description: "Ringkasan aktivitas",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/bookings",
      label: "Booking",
      description: "Jadwal dan klien",
      icon: CalendarCheck,
    },
    {
      href: "/dashboard/timeline",
      label: "Timeline",
      description: "Agenda pelaksanaan",
      icon: Clock3,
    },
    ...(user.role === "ADMIN" ? adminLinks : []),
    {
      href: "/dashboard/payments",
      label: "Pembayaran",
      description: "Tagihan dan bukti",
      icon: CreditCard,
    },
    {
      href: "/dashboard/gallery",
      label: "Galeri",
      description: "Dokumentasi acara",
      icon: Images,
    },
    {
      href: "/dashboard/chat",
      label: "Chat",
      description: "Percakapan booking",
      icon: MessageSquare,
    },
    {
      href: "/dashboard/profile",
      label: "Profil",
      description: "Akun dan identitas",
      icon: UserRound,
    },
  ];

  const currentTitle =
    pageTitles[pathname] ??
    Object.entries(pageTitles).find(([path]) => pathname.startsWith(path))?.[1] ??
    "Dashboard";

  const dateLabel = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  return (
    <div className="dashboard-shell">
      <button
        className="mobile-menu-trigger"
        type="button"
        aria-label="Buka navigasi"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Tutup navigasi"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar${mobileOpen ? " mobile-open" : ""}`}>
        <div className="sidebar-header">
          <Link href="/" className="dashboard-brand" onClick={() => setMobileOpen(false)}>
            <span className="dashboard-brand-mark">W</span>
            <span>
              <strong>Wedding</strong>
              <small>Organizer Suite</small>
            </span>
          </Link>
          <button
            className="sidebar-close"
            type="button"
            aria-label="Tutup navigasi"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-event-card">
          <span className="sidebar-event-icon">
            <Sparkles size={17} />
          </span>
          <div>
            <small>Workspace</small>
            <strong>Wedding operations</strong>
          </div>
          <ChevronRight size={16} />
        </div>

        <div className="sidebar-label">Workspace</div>
        <nav aria-label="Navigasi dashboard">
          {links.map(({ href, label, description, icon: Icon }) => {
            const isActive =
              href === "/dashboard" ? pathname === href : pathname.startsWith(href);

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`nav-link${isActive ? " active" : ""}`}
                href={href}
                key={href}
                onClick={() => setMobileOpen(false)}
              >
                <span className="nav-icon">
                  <Icon size={18} strokeWidth={1.8} />
                </span>
                <span className="nav-copy">
                  <strong>{label}</strong>
                  <small>{description}</small>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <Link className="sidebar-profile" href="/dashboard/profile">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt={user.name} />
            ) : (
              <span>{user.name.slice(0, 1).toUpperCase()}</span>
            )}
            <div>
              <strong>{user.name}</strong>
              <small>{user.role === "ADMIN" ? "Administrator" : "Client account"}</small>
            </div>
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <div className="dashboard-content">
        <header className="dashboard-topbar">
          <div className="topbar-title">
            <span>Wedding operations</span>
            <div>
              <h2>{currentTitle}</h2>
              <PanelLeftClose size={15} />
            </div>
          </div>
          <div className="topbar-actions">
            <div className="today-chip">
              <CalendarCheck size={16} />
              <span>{dateLabel}</span>
            </div>
            <Link className="topbar-chat" href="/dashboard/chat" aria-label="Buka chat">
              <MessageSquare size={18} />
              <span>Chat</span>
            </Link>
          </div>
        </header>

        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}
