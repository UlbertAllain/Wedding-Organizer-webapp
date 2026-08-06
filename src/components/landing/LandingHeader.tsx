import Link from "next/link";

import { navigation } from "@/components/landing/data";

export function LandingHeader() {
  return (
    <header className="studio-header">
      <Link className="studio-brand" href="/" aria-label="Wedding Organizer">
        <span className="studio-brand-mark" aria-hidden="true">
          WO
        </span>
        <span className="studio-brand-copy">
          <strong>Wedding Organizer</strong>
          <small>We plan. You celebrate.</small>
        </span>
      </Link>

      <nav className="studio-nav" aria-label="Navigasi utama">
        {navigation.map((item) => (
          <a href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="studio-header-actions">
        <Link className="studio-login-link" href="/login">
          Masuk
        </Link>
        <Link className="studio-button studio-button-primary studio-button-compact" href="/register">
          Konsultasi
        </Link>
      </div>
    </header>
  );
}
