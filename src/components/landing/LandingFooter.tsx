import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

import { navigation } from "@/components/landing/data";

export function LandingFooter() {
  return (
    <footer className="studio-footer">
      <div className="studio-footer-main">
        <div className="studio-footer-brand">
          <div className="studio-brand">
            <span className="studio-brand-mark" aria-hidden="true">
              WO
            </span>
            <span className="studio-brand-copy">
              <strong>Wedding Organizer</strong>
              <small>We plan. You celebrate.</small>
            </span>
          </div>
          <p>
            Perencana pernikahan yang percaya bahwa setiap cerita layak
            dirayakan dengan indah dan dijalani dengan tenang.
          </p>
          <div className="studio-socials" aria-label="Media sosial">
            <a href="#" aria-label="Instagram">
              <Phone size={16} aria-hidden="true" />
            </a>
            <a href="#" aria-label="YouTube">
              <Phone size={16} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="studio-footer-column">
          <h3>Navigasi</h3>
          {navigation.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
          <Link href="/login">Masuk</Link>
        </div>

        <div className="studio-footer-column">
          <h3>Layanan</h3>
          <a href="#layanan">Full Wedding Planning</a>
          <a href="#layanan">Wedding Day Coordination</a>
          <a href="#layanan">Styling & Vendor Curation</a>
        </div>

        <div className="studio-footer-column studio-footer-contact">
          <h3>Kontak</h3>
          <a href="tel:+6281234567890">
            <Phone size={14} aria-hidden="true" />
            +62 812 3456 7890
          </a>
          <a href="mailto:halo@weddingorganizer.id">
            <Mail size={14} aria-hidden="true" />
            halo@weddingorganizer.id
          </a>
          <span>
            <MapPin size={14} aria-hidden="true" />
            Jakarta, Indonesia
          </span>
          <div
            className="studio-footer-photo"
            role="img"
            aria-label="Detail meja makan pernikahan"
          />
        </div>
      </div>

      <div className="studio-footer-bottom">
        <p>© 2026 Wedding Organizer. All rights reserved.</p>
        <div>
          <a href="#">Privasi</a>
          <span>·</span>
          <a href="#">Syarat & Ketentuan</a>
        </div>
      </div>
    </footer>
  );
}
