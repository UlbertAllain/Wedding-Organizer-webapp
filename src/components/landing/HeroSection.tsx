import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="studio-hero" id="tentang">
      <div className="studio-hero-copy">
        <p className="studio-eyebrow">Wedding planner & event curator</p>
        <h1>
          Pernikahan yang terasa <em>sepenuhnya</em> milik kalian.
        </h1>
        <p className="studio-hero-lead">
          Kami merancang setiap detail dengan hati, kreativitas, dan presisi agar hari
          pernikahan terasa personal—bukan sekadar terlihat indah.
        </p>
        <div className="studio-hero-actions">
          <Link className="studio-button studio-button-primary" href="/register">
            Konsultasi gratis
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <a className="studio-button studio-button-outline" href="#portfolio">
            Lihat portfolio
          </a>
        </div>
      </div>

      <div className="studio-hero-visual" aria-label="Pasangan pengantin dalam momen yang intim">
        <div className="studio-hero-veil" aria-hidden="true" />
        <figure className="studio-hero-couple">
          <div className="studio-photo studio-photo-hero" role="img" aria-label="Pasangan pengantin berpelukan di bawah veil" />
        </figure>
        <figure className="studio-hero-rings">
          <div className="studio-photo studio-photo-rings" role="img" aria-label="Cincin pernikahan di atas undangan" />
          <figcaption>Detail kecil yang tinggal selamanya.</figcaption>
        </figure>
        <div className="studio-since-badge" aria-label="Berdiri sejak 2016">
          <span>Since</span>
          <strong>2016</strong>
        </div>
      </div>
    </section>
  );
}
