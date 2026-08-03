"use client";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Heart,
  Images,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { apiRequest } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import type { PackageRecord } from "@/types/domain";

const processItems = [
  {
    number: "01",
    title: "Pilih paket dan tanggal",
    description:
      "Tentukan skala acara, tanggal, venue, dan kebutuhan awal tanpa formulir yang membingungkan.",
  },
  {
    number: "02",
    title: "Susun vendor dan timeline",
    description:
      "Koordinasikan vendor, agenda, pembayaran, serta detail acara dalam satu ruang kerja.",
  },
  {
    number: "03",
    title: "Pantau sampai hari acara",
    description:
      "Klien dan tim organizer melihat status yang sama, sehingga tidak ada informasi tercecer.",
  },
];

const featureItems = [
  {
    icon: CalendarDays,
    title: "Booking terkontrol",
    description: "Kuota tanggal dijaga secara transaksional untuk mencegah bentrok jadwal.",
  },
  {
    icon: MessageCircleMore,
    title: "Komunikasi terpusat",
    description: "Percakapan penting tetap menempel pada booking yang sedang dikerjakan.",
  },
  {
    icon: Images,
    title: "Dokumentasi rapi",
    description: "Galeri acara dan media pelanggan tersimpan aman melalui Cloudinary.",
  },
  {
    icon: ShieldCheck,
    title: "Akses sesuai peran",
    description: "Admin dan klien hanya melihat tindakan yang memang menjadi kewenangannya.",
  },
];

export default function HomePage() {
  const [packages, setPackages] = useState<PackageRecord[]>([]);

  useEffect(() => {
    apiRequest<PackageRecord[]>("/api/packages?active=true")
      .then(setPackages)
      .catch(() => setPackages([]));
  }, []);

  return (
    <main className="public-site">
      <header className="public-header">
        <Link className="public-brand" href="/" aria-label="Wedding Organizer">
          <span className="brand-mark">WO</span>
          <span>
            <strong>Wedding Organizer</strong>
            <small>Plan beautifully</small>
          </span>
        </Link>

        <nav className="public-links" aria-label="Navigasi utama">
          <a href="#layanan">Layanan</a>
          <a href="#proses">Proses</a>
          <a href="#paket">Paket</a>
        </nav>

        <div className="nav-actions">
          <Link className="button ghost" href="/login">
            Masuk
          </Link>
          <Link className="button primary" href="/register">
            Mulai rencana
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </header>

      <section className="hero editorial-hero">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="kicker-line" />
            <span>Wedding planning, thoughtfully organized</span>
          </div>
          <h1>
            Hari istimewa yang terasa <em>tenang</em>, bukan melelahkan.
          </h1>
          <p className="hero-description">
            Satu ruang kerja untuk memilih paket, mengelola vendor, menyusun
            timeline, memantau pembayaran, dan berkomunikasi dengan tim organizer.
          </p>
          <div className="hero-actions">
            <Link className="button primary button-lg" href="/register">
              Rencanakan pernikahan
              <ArrowRight size={17} />
            </Link>
            <a className="text-link" href="#paket">
              Jelajahi paket <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="hero-proof">
            <div className="proof-avatars" aria-hidden="true">
              <span>R</span>
              <span>A</span>
              <span>N</span>
            </div>
            <div>
              <strong>Satu sumber informasi</strong>
              <span>untuk klien, admin, vendor, dan seluruh agenda acara.</span>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-label="Inspirasi dekorasi pernikahan">
          <div className="hero-photo hero-photo-main" />
          <div className="hero-photo hero-photo-small" />
          <div className="hero-monogram" aria-hidden="true">
            <Heart size={24} strokeWidth={1.4} />
            <span>Plan with intention</span>
          </div>
          <div className="hero-date-card">
            <span>Upcoming</span>
            <strong>Wedding day</strong>
            <div>
              <CalendarDays size={18} />
              <p>
                Timeline, vendor, dan pembayaran tersusun dalam satu tampilan.
              </p>
            </div>
          </div>
          <span className="hero-orbit orbit-one" />
          <span className="hero-orbit orbit-two" />
        </div>
      </section>

      <section className="trust-strip" aria-label="Keunggulan sistem">
        <span>FIREBASE AUTH</span>
        <i />
        <span>FIRESTORE</span>
        <i />
        <span>CLOUDINARY MEDIA</span>
        <i />
        <span>MIDTRANS READY</span>
      </section>

      <section className="section feature-section" id="layanan">
        <div className="section-heading split-heading">
          <div>
            <span className="eyebrow">Ruang kerja menyeluruh</span>
            <h2>Bukan sekadar formulir booking.</h2>
          </div>
          <p>
            Setiap modul dirancang mengikuti alur kerja wedding organizer, bukan
            menumpuk menu yang tidak pernah dipakai.
          </p>
        </div>

        <div className="feature-editorial-grid">
          <article className="feature-story-card">
            <div className="feature-story-photo" />
            <div className="feature-story-overlay">
              <Sparkles size={20} />
              <strong>From first plan to final moment.</strong>
              <p>Semua keputusan penting tetap terbaca dan dapat ditindaklanjuti.</p>
            </div>
          </article>

          <div className="feature-list-grid">
            {featureItems.map(({ icon: Icon, title, description }, index) => (
              <article className="feature-card" key={title}>
                <span className="feature-index">0{index + 1}</span>
                <div className="feature-icon">
                  <Icon size={21} strokeWidth={1.7} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section process-section" id="proses">
        <div className="process-intro">
          <span className="eyebrow light">Alur yang jelas</span>
          <h2>Perencanaan besar, dibagi menjadi langkah yang masuk akal.</h2>
          <p>
            Dashboard mempertemukan sisi emosional sebuah pernikahan dengan
            kebutuhan operasional yang presisi.
          </p>
          <Link className="button light-button" href="/register">
            Buat akun klien <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="process-list">
          {processItems.map((item) => (
            <article className="process-item" key={item.number}>
              <span>{item.number}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <ArrowUpRight size={20} />
            </article>
          ))}
        </div>
      </section>

      <section className="section packages-section" id="paket">
        <div className="section-heading package-heading">
          <div>
            <span className="eyebrow">Paket layanan</span>
            <h2>Pilih fondasi acara, lalu sesuaikan detailnya.</h2>
          </div>
          <p>
            Harga, fasilitas, dan vendor tambahan tampil transparan sebelum
            booking dibuat.
          </p>
        </div>

        <div className="package-showcase-grid">
          {packages.length ? (
            packages.map((item, index) => (
              <article
                className={`package-showcase-card${index === 1 ? " featured" : ""}`}
                key={item.id}
              >
                <div
                  className="package-photo"
                  style={
                    item.imageUrl
                      ? { backgroundImage: `url(${item.imageUrl})` }
                      : undefined
                  }
                >
                  <span>{index === 1 ? "Most considered" : `Collection 0${index + 1}`}</span>
                </div>
                <div className="package-content">
                  <div className="package-title-row">
                    <h3>{item.name}</h3>
                    <ArrowUpRight size={20} />
                  </div>
                  <p>{item.description}</p>
                  <strong className="price">{formatCurrency(item.price)}</strong>
                  <ul className="feature-list">
                    {item.features.slice(0, 5).map((feature) => (
                      <li key={feature}>
                        <Check size={15} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link className="button package-button full" href="/register">
                    Pilih paket
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state package-empty">
              <Sparkles size={24} />
              <strong>Paket sedang disiapkan</strong>
              <span>Admin dapat menambahkan paket dari dashboard.</span>
            </div>
          )}
        </div>
      </section>

      <section className="section closing-section">
        <div className="closing-card">
          <div className="closing-copy">
            <span className="eyebrow light">Ready when you are</span>
            <h2>Mulai dari rencana yang rapi.</h2>
            <p>
              Buat akun, tentukan tanggal, dan biarkan seluruh detail penting
              tersusun dalam satu sistem yang dapat dipantau bersama.
            </p>
            <Link className="button light-button" href="/register">
              Mulai sekarang <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="closing-photo" />
        </div>
      </section>

      <footer className="public-footer">
        <Link className="public-brand footer-brand" href="/">
          <span className="brand-mark">WO</span>
          <span>
            <strong>Wedding Organizer</strong>
            <small>Plan beautifully</small>
          </span>
        </Link>
        <p>Booking dan operasional wedding organizer dalam satu ruang kerja.</p>
        <div>
          <Link href="/login">Masuk</Link>
          <Link href="/register">Daftar</Link>
        </div>
      </footer>
    </main>
  );
}
