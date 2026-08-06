"use client";

import { ArrowUpRight } from "lucide-react";
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

  const daysUntilNext = nextBooking
    ? Math.max(
        0,
        Math.ceil(
          (new Date(nextBooking.weddingDate).getTime() - initialNow) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

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
    .slice(0, 5);

  const attentionItems = [
    pendingPayments.length
      ? {
          label: "Pembayaran menunggu",
          value: `${pendingPayments.length} tagihan`,
          note: formatCurrency(pendingValue),
          href: "/dashboard/payments",
        }
      : null,
    activeBookings.filter((item) => item.status === "PENDING").length
      ? {
          label: "Booking perlu ditinjau",
          value: `${activeBookings.filter((item) => item.status === "PENDING").length} booking`,
          note: "Perlu konfirmasi tim",
          href: "/dashboard/bookings",
        }
      : null,
    {
      label: "Dokumentasi tersimpan",
      value: `${gallery.length} foto`,
      note: "Koleksi galeri saat ini",
      href: "/dashboard/gallery",
    },
  ].filter(Boolean) as Array<{
    label: string;
    value: string;
    note: string;
    href: string;
  }>;

  return (
    <div className="page-stack overview-page">
      <section className="overview-opening">
        <div>
          <p className="section-label">Hari ini</p>
          <h2>
            Selamat datang, <em>{user.name.split(" ")[0]}</em>.
          </h2>
        </div>
        <p>
          {user.role === "ADMIN"
            ? "Fokuskan perhatian pada keputusan yang tertunda dan acara terdekat."
            : "Semua perkembangan rencana pernikahanmu dirangkum di halaman ini."}
        </p>
      </section>

      <section className="overview-focus-grid">
        <article className="featured-event">
          <header>
            <div>
              <span>Acara terdekat</span>
              <p>{daysUntilNext === null ? "Belum dijadwalkan" : `${daysUntilNext} hari lagi`}</p>
            </div>
            <Link href="/dashboard/bookings" aria-label="Buka semua booking">
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </header>

          {nextBooking ? (
            <div className="featured-event-body">
              <div className="featured-event-date">
                <strong>
                  {new Intl.DateTimeFormat("id-ID", { day: "2-digit" }).format(
                    new Date(nextBooking.weddingDate),
                  )}
                </strong>
                <span>
                  {new Intl.DateTimeFormat("id-ID", { month: "long" }).format(
                    new Date(nextBooking.weddingDate),
                  )}
                </span>
                <small>{new Date(nextBooking.weddingDate).getFullYear()}</small>
              </div>

              <div className="featured-event-copy">
                <span className={`badge ${nextBooking.status.toLowerCase()}`}>
                  {statusLabels[nextBooking.status]}
                </span>
                <h3>
                  {nextBooking.groomName} <em>&amp;</em> {nextBooking.brideName}
                </h3>
                <p>{nextBooking.packageName}</p>
              </div>

              <dl>
                <div>
                  <dt>Venue</dt>
                  <dd>{nextBooking.venue}</dd>
                </div>
                <div>
                  <dt>Tanggal</dt>
                  <dd>{formatDate(nextBooking.weddingDate)}</dd>
                </div>
                <div>
                  <dt>Nilai booking</dt>
                  <dd>{formatCurrency(nextBooking.totalPrice)}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="featured-event-empty">
              <h3>Belum ada acara mendatang.</h3>
              <p>Booking aktif akan muncul di sini setelah dibuat atau dikonfirmasi.</p>
              <Link className="button button-light" href="/dashboard/bookings">
                Buka booking
              </Link>
            </div>
          )}
        </article>

        <aside className="attention-panel">
          <header>
            <p className="section-label">Perlu perhatian</p>
            <h3>Prioritas berikutnya</h3>
          </header>
          <div className="attention-list">
            {attentionItems.map((item, index) => (
              <Link href={item.href} key={`${item.label}-${index}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <small>{item.label}</small>
                  <strong>{loading ? "—" : item.value}</strong>
                  <p>{loading ? "Memuat data" : item.note}</p>
                </div>
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section className="overview-ledger" aria-label="Ringkasan data">
        <div>
          <span>01</span>
          <p>Booking aktif</p>
          <strong>{loading ? "—" : activeBookings.length}</strong>
          <small>dari {bookings.length} booking tercatat</small>
        </div>
        <div>
          <span>02</span>
          <p>Menunggu pembayaran</p>
          <strong>{loading ? "—" : pendingPayments.length}</strong>
          <small>{loading ? "Memuat data" : formatCurrency(pendingValue)}</small>
        </div>
        <div>
          <span>03</span>
          <p>Nilai terbayar</p>
          <strong className="ledger-currency">
            {loading ? "—" : formatCurrency(paidValue)}
          </strong>
          <small>pembayaran berstatus lunas</small>
        </div>
        <div>
          <span>04</span>
          <p>Dokumentasi</p>
          <strong>{loading ? "—" : gallery.length}</strong>
          <small>foto tersimpan</small>
        </div>
      </section>

      <section className="overview-bottom-grid">
        <article className="recent-bookings-panel">
          <header>
            <div>
              <p className="section-label">Aktivitas</p>
              <h3>Booking terbaru</h3>
            </div>
            <Link href="/dashboard/bookings">Lihat semua</Link>
          </header>

          <div className="recent-booking-list">
            {recentBookings.map((item, index) => (
              <Link href="/dashboard/bookings" key={item.id}>
                <span className="recent-booking-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <strong>
                    {item.groomName} &amp; {item.brideName}
                  </strong>
                  <small>
                    {item.venue} · {formatDate(item.weddingDate)}
                  </small>
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

        <article className="workspace-next-panel">
          <p className="section-label section-label-light">Lanjutkan pekerjaan</p>
          <h3>Semua detail penting tetap terhubung.</h3>
          <p>
            Buka timeline untuk agenda, pembayaran untuk tagihan, atau percakapan untuk
            koordinasi terbaru.
          </p>
          <nav>
            <Link href="/dashboard/timeline">
              Timeline <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
            <Link href="/dashboard/payments">
              Pembayaran <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
            <Link href="/dashboard/chat">
              Percakapan <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </nav>
        </article>
      </section>
    </div>
  );
}
