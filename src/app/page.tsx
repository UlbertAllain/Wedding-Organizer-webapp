"use client";

import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { apiRequest } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import type { PackageRecord } from "@/types/domain";

const services = [
  {
    number: "01",
    title: "Perencanaan acara",
    description:
      "Kami menyusun kebutuhan, prioritas, anggaran, dan keputusan penting menjadi rencana kerja yang realistis.",
  },
  {
    number: "02",
    title: "Kurasi vendor",
    description:
      "Rekomendasi vendor disesuaikan dengan karakter acara, bukan sekadar daftar pilihan yang panjang.",
  },
  {
    number: "03",
    title: "Koordinasi hari acara",
    description:
      "Tim mengawal timeline, vendor, keluarga, dan detail lapangan agar pasangan dapat menikmati hari pernikahan.",
  },
];

const process = [
  ["01", "Konsultasi", "Ceritakan visi, kebutuhan, dan batas anggaran."],
  ["02", "Perencanaan", "Kami merangkai konsep, vendor, dan timeline kerja."],
  ["03", "Pelaksanaan", "Seluruh detail dikawal sampai acara selesai."],
];

export default function HomePage() {
  const [packages, setPackages] = useState<PackageRecord[]>([]);

  useEffect(() => {
    let cancelled = false;

    apiRequest<PackageRecord[]>("/api/packages?active=true")
      .then((data) => {
        if (!cancelled) setPackages(data);
      })
      .catch(() => {
        if (!cancelled) setPackages([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="public-site">
      <header className="public-header">
        <Link className="public-brand" href="/" aria-label="Wedding Organizer">
          <span className="public-brand-name">Wedding Organizer</span>
          <span className="public-brand-note">Planning &amp; coordination</span>
        </Link>

        <nav className="public-links" aria-label="Navigasi utama">
          <a href="#layanan">Layanan</a>
          <a href="#cara-kerja">Cara kerja</a>
          <a href="#paket">Paket</a>
        </nav>

        <div className="nav-actions">
          <Link className="button button-quiet" href="/login">
            Masuk
          </Link>
          <Link className="button button-dark" href="/register">
            Konsultasi
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <section className="public-hero">
        <div className="public-hero-copy">
          <p className="section-label">Wedding planning, made personal</p>
          <h1>
            Pernikahan yang terasa <em>seperti kalian.</em>
          </h1>
          <p className="public-hero-lead">
            Kami membantu pasangan merencanakan, memilih, dan mengeksekusi setiap
            detail dengan tenang—tanpa membuat prosesnya terasa rumit.
          </p>
          <div className="public-hero-actions">
            <Link className="button button-dark button-large" href="/register">
              Mulai konsultasi
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <a className="inline-link" href="#portfolio">
              Lihat pendekatan kami
            </a>
          </div>
          <dl className="public-hero-facts">
            <div>
              <dt>Satu tim</dt>
              <dd>dari konsultasi sampai hari acara</dd>
            </div>
            <div>
              <dt>Satu ruang kerja</dt>
              <dd>untuk timeline, pembayaran, dan komunikasi</dd>
            </div>
          </dl>
        </div>

        <figure className="public-hero-image">
          <div className="public-photo public-photo-couple" />
          <figcaption>
            <span>Intentional weddings</span>
            <span>Jakarta · Bandung · Bali</span>
          </figcaption>
        </figure>
      </section>

      <section className="public-assurance" aria-label="Nilai layanan">
        <p>Rencana yang transparan</p>
        <p>Vendor yang relevan</p>
        <p>Koordinasi satu pintu</p>
        <p>Informasi yang selalu tercatat</p>
      </section>

      <section className="public-section services-section" id="layanan">
        <div className="section-intro">
          <p className="section-label">Layanan inti</p>
          <h2>Struktur yang rapi, tetap terasa personal.</h2>
          <p>
            Sistem kerja kami menyederhanakan keputusan besar menjadi langkah yang
            jelas, tanpa menghilangkan karakter acara yang ingin kalian bangun.
          </p>
        </div>

        <div className="services-layout">
          <div className="service-list">
            {services.map((service) => (
              <article className="service-row" key={service.number}>
                <span>{service.number}</span>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              </article>
            ))}
          </div>
          <figure className="service-image-frame">
            <div className="public-photo public-photo-table" />
            <figcaption>Detail yang konsisten membentuk pengalaman yang utuh.</figcaption>
          </figure>
        </div>
      </section>

      <section className="portfolio-section" id="portfolio">
        <div className="portfolio-copy">
          <p className="section-label section-label-light">Pendekatan kami</p>
          <h2>Tidak ada dua pernikahan yang harus terlihat sama.</h2>
          <p>
            Konsep yang baik bukan soal menambah dekorasi sebanyak mungkin. Ia
            lahir dari pilihan yang konsisten—venue, warna, ritme acara, sampai
            cara tamu merasakan setiap momen.
          </p>
          <Link href="/register" className="inline-link inline-link-light">
            Ceritakan rencana kalian
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <figure className="portfolio-image">
          <div className="public-photo public-photo-venue" />
          <figcaption>
            <strong>Modern ceremony</strong>
            <span>Natural texture, restrained palette, clear focal point.</span>
          </figcaption>
        </figure>
      </section>

      <section className="public-section process-section" id="cara-kerja">
        <div className="section-intro section-intro-wide">
          <p className="section-label">Cara kerja</p>
          <h2>Jelas sejak pertemuan pertama.</h2>
        </div>
        <div className="process-grid">
          {process.map(([number, title, description]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-section package-section" id="paket">
        <div className="section-intro package-intro">
          <div>
            <p className="section-label">Paket layanan</p>
            <h2>Pilih cakupan kerja yang paling masuk akal.</h2>
          </div>
          <p>
            Setiap paket dapat dikembangkan bersama vendor tambahan sesuai kebutuhan
            dan karakter acara.
          </p>
        </div>

        <div className="package-grid">
          {packages.length ? (
            packages.map((item, index) => (
              <article className="package-card" key={item.id}>
                <div
                  className="package-card-image"
                  style={
                    item.imageUrl
                      ? { backgroundImage: `url(${item.imageUrl})` }
                      : undefined
                  }
                >
                  <span>Paket {String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="package-card-body">
                  <div className="package-card-heading">
                    <h3>{item.name}</h3>
                    <strong>{formatCurrency(item.price)}</strong>
                  </div>
                  <p>{item.description}</p>
                  <ul>
                    {item.features.slice(0, 4).map((feature) => (
                      <li key={feature}>
                        <Check size={14} aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link className="inline-link" href="/register">
                    Pilih paket
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="package-empty">
              <p className="section-label">Paket segera tersedia</p>
              <h3>Katalog sedang disusun oleh tim organizer.</h3>
              <p>Kalian tetap dapat memulai konsultasi dan mendiskusikan kebutuhan khusus.</p>
              <Link className="button button-dark" href="/register">
                Mulai konsultasi
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="testimonial-section">
        <blockquote>
          “Proses yang baik tidak mengambil alih cerita pasangan. Ia memberi ruang
          agar cerita itu dapat diwujudkan dengan lebih tenang.”
        </blockquote>
        <p>Prinsip kerja Wedding Organizer</p>
      </section>

      <section className="public-cta">
        <div>
          <p className="section-label section-label-light">Mulai dari percakapan</p>
          <h2>Sudah punya tanggal, atau masih merangkai kemungkinan?</h2>
        </div>
        <Link className="button button-light button-large" href="/register">
          Jadwalkan konsultasi
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>

      <footer className="public-footer">
        <div>
          <strong>Wedding Organizer</strong>
          <span>Planning &amp; coordination</span>
        </div>
        <p>Perencanaan yang terstruktur untuk perayaan yang terasa personal.</p>
        <div>
          <Link href="/login">Masuk</Link>
          <a href="#layanan">Layanan</a>
          <a href="#paket">Paket</a>
        </div>
      </footer>
    </main>
  );
}
