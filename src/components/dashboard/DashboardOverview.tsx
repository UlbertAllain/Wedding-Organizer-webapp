"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  CreditCard,
  HeartHandshake,
  MessageSquareMore,
  Sparkles,
  WalletCards,
} from "lucide-react";

import { apiRequest } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/format";
import type {
  BookingRecord,
  GalleryRecord,
  PaymentRecord,
  UserProfile,
} from "@/types/domain";

interface DashboardOverviewProps {
  user: UserProfile;
}

const statusProgress: Record<BookingRecord["status"], number> = {
  PENDING: 12,
  CONFIRMED: 32,
  REJECTED: 0,
  PAID: 56,
  IN_PROGRESS: 78,
  COMPLETED: 100,
  CANCELLED: 0,
};

export default function DashboardOverview({ user }: DashboardOverviewProps) {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [gallery, setGallery] = useState<GalleryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      apiRequest<BookingRecord[]>("/api/bookings"),
      apiRequest<PaymentRecord[]>("/api/payments"),
      apiRequest<GalleryRecord[]>("/api/gallery"),
    ]).then(([bookingResult, paymentResult, galleryResult]) => {
      if (bookingResult.status === "fulfilled") setBookings(bookingResult.value);
      if (paymentResult.status === "fulfilled") setPayments(paymentResult.value);
      if (galleryResult.status === "fulfilled") setGallery(galleryResult.value);
      setLoading(false);
    });
  }, []);

  const activeBookings = bookings.filter(
    (item) => !["COMPLETED", "CANCELLED", "REJECTED"].includes(item.status),
  );
  const paidValue = payments
    .filter((item) => item.status === "PAID")
    .reduce((sum, item) => sum + item.amount, 0);
  const pendingPayments = payments.filter((item) => item.status === "PENDING").length;
  const nextBooking = useMemo(
    () =>
      [...activeBookings]
        .filter((item) => new Date(item.weddingDate).getTime() >= Date.now())
        .sort(
          (first, second) =>
            new Date(first.weddingDate).getTime() -
            new Date(second.weddingDate).getTime(),
        )[0],
    [activeBookings],
  );
  const progress = nextBooking ? statusProgress[nextBooking.status] : 0;

  return (
    <div className="page-stack overview-page">
      <section className="overview-hero">
        <div className="overview-hero-copy">
          <span className="eyebrow light">Good to see you</span>
          <h1>
            Selamat datang,
            <br />
            {user.name}.
          </h1>
          <p>
            Pantau setiap keputusan penting tanpa kehilangan konteks antara klien,
            timeline, pembayaran, dan dokumentasi.
          </p>
          <div className="overview-hero-actions">
            <Link className="button light-button" href="/dashboard/bookings">
              Lihat booking <ArrowRight size={16} />
            </Link>
            <Link className="overview-chat-link" href="/dashboard/chat">
              <MessageSquareMore size={17} />
              Buka percakapan
            </Link>
          </div>
        </div>
        <div className="overview-hero-art" aria-hidden="true">
          <span className="art-ring ring-a" />
          <span className="art-ring ring-b" />
          <div className="art-card art-card-main">
            <HeartHandshake size={26} />
            <span>Everything in sync</span>
          </div>
          <div className="art-card art-card-small">
            <Sparkles size={18} />
            <span>Plan with clarity</span>
          </div>
        </div>
      </section>

      <section className="metric-grid">
        <article className="metric-card">
          <span className="metric-icon peach">
            <CalendarDays size={20} />
          </span>
          <div>
            <small>Booking aktif</small>
            <strong>{loading ? "—" : activeBookings.length}</strong>
            <p>{bookings.length} booking tercatat</p>
          </div>
          <Link href="/dashboard/bookings" aria-label="Lihat booking">
            <ArrowRight size={17} />
          </Link>
        </article>
        <article className="metric-card">
          <span className="metric-icon sage">
            <WalletCards size={20} />
          </span>
          <div>
            <small>Nilai terbayar</small>
            <strong className="metric-currency">
              {loading ? "—" : formatCurrency(paidValue)}
            </strong>
            <p>{pendingPayments} pembayaran menunggu</p>
          </div>
          <Link href="/dashboard/payments" aria-label="Lihat pembayaran">
            <ArrowRight size={17} />
          </Link>
        </article>
        <article className="metric-card">
          <span className="metric-icon lavender">
            <Camera size={20} />
          </span>
          <div>
            <small>Dokumentasi</small>
            <strong>{loading ? "—" : gallery.length}</strong>
            <p>foto tersimpan di galeri</p>
          </div>
          <Link href="/dashboard/gallery" aria-label="Lihat galeri">
            <ArrowRight size={17} />
          </Link>
        </article>
      </section>

      <section className="overview-grid">
        <article className="next-event-card">
          <div className="card-section-heading">
            <div>
              <span className="eyebrow">Next milestone</span>
              <h2>Acara terdekat</h2>
            </div>
            <Link href="/dashboard/bookings">Semua booking</Link>
          </div>

          {nextBooking ? (
            <div className="next-event-content">
              <div className="event-date-block">
                <span>
                  {new Intl.DateTimeFormat("id-ID", { month: "short" })
                    .format(new Date(nextBooking.weddingDate))
                    .toUpperCase()}
                </span>
                <strong>{new Date(nextBooking.weddingDate).getDate()}</strong>
                <small>{new Date(nextBooking.weddingDate).getFullYear()}</small>
              </div>
              <div className="event-main-copy">
                <span className={`badge ${nextBooking.status.toLowerCase()}`}>
                  {nextBooking.status.replaceAll("_", " ")}
                </span>
                <h3>
                  {nextBooking.groomName} &amp; {nextBooking.brideName}
                </h3>
                <p>{nextBooking.packageName}</p>
                <div className="event-meta-row">
                  <span>
                    <CalendarDays size={15} /> {formatDate(nextBooking.weddingDate)}
                  </span>
                  <span>
                    <Clock3 size={15} /> {nextBooking.venue}
                  </span>
                </div>
              </div>
              <div className="event-progress">
                <div
                  className="progress-ring"
                  style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}
                >
                  <span>{progress}%</span>
                </div>
                <small>Progress</small>
              </div>
            </div>
          ) : (
            <div className="overview-empty">
              <CalendarDays size={26} />
              <div>
                <strong>Belum ada acara mendatang</strong>
                <p>Booking baru akan muncul di bagian ini secara otomatis.</p>
              </div>
              <Link className="button secondary small" href="/dashboard/bookings">
                Buka booking
              </Link>
            </div>
          )}
        </article>

        <article className="quick-actions-card">
          <div className="card-section-heading">
            <div>
              <span className="eyebrow">Shortcuts</span>
              <h2>Aksi cepat</h2>
            </div>
          </div>
          <div className="quick-action-list">
            <Link href="/dashboard/timeline">
              <span className="quick-action-icon">
                <Clock3 size={18} />
              </span>
              <div>
                <strong>Kelola timeline</strong>
                <small>Susun agenda pelaksanaan</small>
              </div>
              <ArrowRight size={16} />
            </Link>
            <Link href="/dashboard/payments">
              <span className="quick-action-icon">
                <CreditCard size={18} />
              </span>
              <div>
                <strong>Cek pembayaran</strong>
                <small>Verifikasi status tagihan</small>
              </div>
              <ArrowRight size={16} />
            </Link>
            <Link href="/dashboard/gallery">
              <span className="quick-action-icon">
                <Camera size={18} />
              </span>
              <div>
                <strong>Buka galeri</strong>
                <small>Lihat dokumentasi acara</small>
              </div>
              <ArrowRight size={16} />
            </Link>
          </div>
        </article>
      </section>

      <section className="status-rail">
        <div>
          <span className="status-dot online" />
          <p>
            <strong>Sistem operasional aktif</strong>
            <span>Firebase, Firestore, dan Cloudinary siap digunakan.</span>
          </p>
        </div>
        <div className="status-security">
          <CheckCircle2 size={17} />
          <span>Role-protected workspace</span>
        </div>
      </section>
    </div>
  );
}
