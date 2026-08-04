"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

const statusLabels: Record<BookingRecord["status"], string> = {
  PENDING: "Menunggu konfirmasi",
  CONFIRMED: "Terkonfirmasi",
  REJECTED: "Ditolak",
  PAID: "Pembayaran selesai",
  IN_PROGRESS: "Dalam persiapan",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export default function DashboardOverview({ user }: DashboardOverviewProps) {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [gallery, setGallery] = useState<GalleryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      apiRequest<BookingRecord[]>("/api/bookings"),
      apiRequest<PaymentRecord[]>("/api/payments"),
      apiRequest<GalleryRecord[]>("/api/gallery"),
    ]).then(([bookingResult, paymentResult, galleryResult]) => {
      if (cancelled) return;
      if (bookingResult.status === "fulfilled") setBookings(bookingResult.value);
      if (paymentResult.status === "fulfilled") setPayments(paymentResult.value);
      if (galleryResult.status === "fulfilled") setGallery(galleryResult.value);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const activeBookings = useMemo(
    () =>
      bookings.filter(
        (item) => !["COMPLETED", "CANCELLED", "REJECTED"].includes(item.status),
      ),
    [bookings],
  );

  const nextBooking = useMemo(
    () =>
      [...activeBookings]
        .filter((item) => new Date(item.weddingDate).getTime() >= initialNow)
        .sort(
          (first, second) =>
            new Date(first.weddingDate).getTime() -
            new Date(second.weddingDate).getTime(),
        )[0],
    [activeBookings, initialNow],
  );

  const paidValue = payments
    .filter((item) => item.status === "PAID")
    .reduce((sum, item) => sum + item.amount, 0);
  const pendingPayments = payments.filter((item) => item.status === "PENDING");
  const pendingValue = pendingPayments.reduce((sum, item) => sum + item.amount, 0);
  const recentBookings = [...bookings]
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    )
    .slice(0, 4);

  return (
    <div className="page-stack overview-page">
      <section className="overview-intro">
        <div>
          <p className="section-label">Selamat datang</p>
          <h2>{user.name}</h2>
          <p>
            {user.role === "ADMIN"
              ? "Berikut prioritas operasional yang perlu diperhatikan hari ini."
              : "Berikut perkembangan rencana pernikahan yang tercatat saat ini."}
          </p>
        </div>
        <span className="role-label">{user.role === "ADMIN" ? "Administrator" : "Akun klien"}</span>
      </section>

      <section className="overview-primary-grid">
        <article className="next-event-panel">
          <header>
            <p className="section-label">Acara terdekat</p>
            <Link href="/dashboard/bookings">
              Semua booking <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </header>

          {nextBooking ? (
            <div className="next-event-detail">
              <div className="next-event-date">
                <span>
                  {new Intl.DateTimeFormat("id-ID", { month: "short" })
                    .format(new Date(nextBooking.weddingDate))
                    .toUpperCase()}
                </span>
                <strong>{new Date(nextBooking.weddingDate).getDate()}</strong>
                <small>{new Date(nextBooking.weddingDate).getFullYear()}</small>
              </div>

              <div className="next-event-copy">
                <span className={`badge ${nextBooking.status.toLowerCase()}`}>
                  {statusLabels[nextBooking.status]}
                </span>
                <h3>
                  {nextBooking.groomName} <em>&amp;</em> {nextBooking.brideName}
                </h3>
                <p>{nextBooking.packageName}</p>
                <dl>
                  <div>
                    <dt>Tanggal</dt>
                    <dd>{formatDate(nextBooking.weddingDate)}</dd>
                  </div>
                  <div>
                    <dt>Venue</dt>
                    <dd>{nextBooking.venue}</dd>
                  </div>
                  <div>
                    <dt>Nilai booking</dt>
                    <dd>{formatCurrency(nextBooking.totalPrice)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : (
            <div className="overview-empty">
              <h3>Belum ada acara mendatang.</h3>
              <p>Booking yang aktif akan tampil di sini setelah dibuat atau dikonfirmasi.</p>
              <Link className="button button-outline" href="/dashboard/bookings">
                Buka booking
              </Link>
            </div>
          )}
        </article>

        <aside className="overview-summary-panel">
          <p className="section-label">Ringkasan</p>
          <dl>
            <div>
              <dt>Booking aktif</dt>
              <dd>{loading ? "—" : activeBookings.length}</dd>
              <small>dari {bookings.length} booking tercatat</small>
            </div>
            <div>
              <dt>Pembayaran menunggu</dt>
              <dd>{loading ? "—" : pendingPayments.length}</dd>
              <small>{loading ? "Memuat data" : formatCurrency(pendingValue)}</small>
            </div>
            <div>
              <dt>Nilai terbayar</dt>
              <dd className="summary-currency">{loading ? "—" : formatCurrency(paidValue)}</dd>
              <small>pembayaran berstatus lunas</small>
            </div>
            <div>
              <dt>Dokumentasi</dt>
              <dd>{loading ? "—" : gallery.length}</dd>
              <small>foto tersimpan</small>
            </div>
          </dl>
        </aside>
      </section>

      <section className="overview-secondary-grid">
        <article className="overview-list-panel">
          <header>
            <div>
              <p className="section-label">Aktivitas</p>
              <h3>Booking terbaru</h3>
            </div>
            <Link href="/dashboard/bookings">Lihat semua</Link>
          </header>

          <div className="compact-record-list">
            {recentBookings.map((item) => (
              <Link href="/dashboard/bookings" key={item.id}>
                <div>
                  <strong>{item.groomName} &amp; {item.brideName}</strong>
                  <span>{item.venue} · {formatDate(item.weddingDate)}</span>
                </div>
                <span className={`badge ${item.status.toLowerCase()}`}>
                  {statusLabels[item.status]}
                </span>
              </Link>
            ))}
            {!recentBookings.length && (
              <div className="list-empty">Belum ada booking yang tercatat.</div>
            )}
          </div>
        </article>

        <article className="workspace-links-panel">
          <p className="section-label">Lanjutkan pekerjaan</p>
          <h3>Akses cepat</h3>
          <nav>
            <Link href="/dashboard/timeline">
              <span>
                <strong>Timeline acara</strong>
                <small>Susun agenda persiapan dan pelaksanaan</small>
              </span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/dashboard/payments">
              <span>
                <strong>Pembayaran</strong>
                <small>Periksa tagihan dan bukti transfer</small>
              </span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/dashboard/chat">
              <span>
                <strong>Percakapan</strong>
                <small>Lanjutkan koordinasi terkait booking</small>
              </span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </nav>
        </article>
      </section>
    </div>
  );
}
