"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";

import { apiRequest } from "@/lib/api-client";
import { uploadImage } from "@/lib/cloudinary/client";
import { formatCurrency, formatDate } from "@/lib/format";
import type {
  BookingRecord,
  PaymentRecord,
  PaymentStatus,
  UserRole,
} from "@/types/domain";

export default function PaymentManager({ role }: { role: UserRole }) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    const [paymentData, bookingData] = await Promise.all([
      apiRequest<PaymentRecord[]>("/api/payments"),
      apiRequest<BookingRecord[]>("/api/bookings"),
    ]);
    setPayments(paymentData);
    setBookings(bookingData);
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      apiRequest<PaymentRecord[]>("/api/payments"),
      apiRequest<BookingRecord[]>("/api/bookings"),
    ])
      .then(([paymentData, bookingData]) => {
        if (cancelled) return;

        setPayments(paymentData);
        setBookings(bookingData);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Load failed");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function payMidtrans(bookingId: string) {
    setBusyId(bookingId);
    setMessage("");

    try {
      const result = await apiRequest<{ redirectUrl: string }>("/api/payments", {
        method: "POST",
        body: JSON.stringify({ bookingId }),
      });
      window.location.assign(result.redirectUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Payment failed");
      setBusyId("");
    }
  }

  async function uploadProof(
    event: ChangeEvent<HTMLInputElement>,
    bookingId: string,
  ) {
    const inputElement = event.currentTarget;
    const file = inputElement.files?.[0];
    if (!file) return;

    setBusyId(bookingId);
    setMessage("");

    try {
      const media = await uploadImage(file, "payments");
      await apiRequest("/api/payments/manual", {
        method: "POST",
        body: JSON.stringify({
          bookingId,
          proofUrl: media.imageUrl,
          proofPublicId: media.imagePublicId,
        }),
      });
      setMessage("Bukti pembayaran dikirim untuk verifikasi admin.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusyId("");
      inputElement.value = "";
    }
  }

  async function update(id: string, status: PaymentStatus) {
    try {
      await apiRequest(`/api/payments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Update failed");
    }
  }

  const payableBookings = bookings.filter((item) => item.status === "CONFIRMED");

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Keuangan</span>
          <h1>Pembayaran</h1>
          <p>
            Pantau tagihan, pembayaran digital, dan bukti transfer manual tanpa
            kehilangan hubungan dengan booking terkait.
          </p>
        </div>
      </header>

      {message && <p className="alert">{message}</p>}

      {role === "USER" && (
        <section className="card-grid two">
          {payableBookings.map((item) => (
            <article className="card" key={item.id}>
              <h3>{item.packageName}</h3>
              <p>
                {formatDate(item.weddingDate)} · {item.venue}
              </p>
              <strong className="price">{formatCurrency(item.totalPrice)}</strong>
              <div className="row gap wrap">
                <button
                  className="button primary"
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => payMidtrans(item.id)}
                >
                  Bayar via Midtrans
                </button>
                <label className="button secondary file-button">
                  Upload bukti
                  <input
                    type="file"
                    accept="image/*"
                    disabled={busyId === item.id}
                    onChange={(event) => uploadProof(event, item.id)}
                  />
                </label>
              </div>
            </article>
          ))}
          {!payableBookings.length && (
            <div className="empty-state">Tidak ada booking yang perlu dibayar.</div>
          )}
        </section>
      )}

      <section className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Klien</th>
              <th>Nominal</th>
              <th>Metode</th>
              <th>Status</th>
              <th>Bukti</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((item) => (
              <tr key={item.id}>
                <td>{item.userName}</td>
                <td>{formatCurrency(item.amount)}</td>
                <td>{item.provider}</td>
                <td>
                  <span className={`badge ${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  {item.proofUrl ? (
                    <a href={item.proofUrl} target="_blank" rel="noreferrer">
                      Lihat bukti
                    </a>
                  ) : item.paymentUrl ? (
                    <a href={item.paymentUrl} target="_blank" rel="noreferrer">
                      Buka pembayaran
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {role === "ADMIN" && item.status === "PENDING" ? (
                    <div className="row gap">
                      <button
                        className="button primary small"
                        type="button"
                        onClick={() => update(item.id, "PAID")}
                      >
                        Setujui
                      </button>
                      <button
                        className="button danger small"
                        type="button"
                        onClick={() => update(item.id, "FAILED")}
                      >
                        Tolak
                      </button>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {!payments.length && (
              <tr>
                <td className="empty-cell" colSpan={6}>
                  Belum ada pembayaran.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
