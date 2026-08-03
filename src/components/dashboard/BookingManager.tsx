"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { BOOKING_TRANSITIONS } from "@/features/bookings/status";
import { apiRequest } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/format";
import type {
  BookingRecord,
  BookingStatus,
  PackageRecord,
  UserRole,
  VendorRecord,
} from "@/types/domain";

export default function BookingManager({ role }: { role: UserRole }) {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const [bookingData, packageData, vendorData] = await Promise.all([
      apiRequest<BookingRecord[]>("/api/bookings"),
      apiRequest<PackageRecord[]>("/api/packages?active=true"),
      apiRequest<VendorRecord[]>("/api/vendors?active=true"),
    ]);

    setBookings(bookingData);
    setPackages(packageData);
    setVendors(vendorData);
  }, []);

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, [load]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const weddingDate = new Date(String(form.get("weddingDate")));

    try {
      await apiRequest("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          packageId: String(form.get("packageId")),
          weddingDate: weddingDate.toISOString(),
          venue: String(form.get("venue")),
          venueAddress: String(form.get("venueAddress")),
          theme: String(form.get("theme") || "") || null,
          guestCount: Number(form.get("guestCount")),
          groomName: String(form.get("groomName")),
          brideName: String(form.get("brideName")),
          groomPhone: String(form.get("groomPhone")),
          bridePhone: String(form.get("bridePhone")),
          ceremonyType: String(form.get("ceremonyType")),
          notes: String(form.get("notes") || "") || null,
          selectedVendorIds: form.getAll("selectedVendorIds").map(String),
        }),
      });

      formElement.reset();
      setMessage("Booking berhasil dibuat.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Booking failed");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(id: string, status: BookingStatus) {
    try {
      await apiRequest(`/api/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Update failed");
    }
  }

  const allVendorTotal = useMemo(
    () => vendors.reduce((sum, item) => sum + (item.price ?? 0), 0),
    [vendors],
  );

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Operasional</span>
          <h1>Booking</h1>
          <p>
            Kelola jadwal, pilihan paket, vendor, dan progres setiap pasangan
            dari satu tampilan yang mudah dipantau.
          </p>
        </div>
      </header>

      {message && <p className="alert">{message}</p>}

      {role === "USER" && (
        <form className="panel form-grid" onSubmit={create}>
          <h2 className="span-full">Booking baru</h2>
          <label>
            Paket
            <select name="packageId" required>
              <option value="">Pilih paket</option>
              {packages.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name} — {formatCurrency(item.price)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tanggal acara
            <input type="datetime-local" name="weddingDate" required />
          </label>
          <label>
            Nama mempelai pria
            <input name="groomName" required />
          </label>
          <label>
            Nama mempelai wanita
            <input name="brideName" required />
          </label>
          <label>
            Telepon mempelai pria
            <input name="groomPhone" type="tel" required />
          </label>
          <label>
            Telepon mempelai wanita
            <input name="bridePhone" type="tel" required />
          </label>
          <label>
            Venue
            <input name="venue" required />
          </label>
          <label>
            Jenis akad/acara
            <input name="ceremonyType" required />
          </label>
          <label className="span-full">
            Alamat venue
            <textarea name="venueAddress" required />
          </label>
          <label>
            Tema
            <input name="theme" />
          </label>
          <label>
            Jumlah tamu
            <input name="guestCount" type="number" min="1" required />
          </label>

          <fieldset className="checkbox-grid">
            <legend>
              Vendor tambahan{" "}
              <span className="muted">
                (total bila semua dipilih {formatCurrency(allVendorTotal)})
              </span>
            </legend>
            {vendors.map((item) => (
              <label className="check-row" key={item.id}>
                <input
                  type="checkbox"
                  name="selectedVendorIds"
                  value={item.id}
                />
                <span>
                  {item.name} · {item.category} · {formatCurrency(item.price ?? 0)}
                </span>
              </label>
            ))}
          </fieldset>

          <label className="span-full">
            Catatan
            <textarea name="notes" />
          </label>
          <button className="button primary" disabled={busy}>
            {busy ? "Menyimpan..." : "Buat booking"}
          </button>
        </form>
      )}

      <section className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Klien</th>
              <th>Acara</th>
              <th>Paket</th>
              <th>Total</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.userName}</strong>
                  <span>{item.userEmail}</span>
                </td>
                <td>
                  <strong>{formatDate(item.weddingDate)}</strong>
                  <span>{item.venue}</span>
                </td>
                <td>{item.packageName}</td>
                <td>{formatCurrency(item.totalPrice)}</td>
                <td>
                  <span className={`badge ${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  {role === "ADMIN" ? (
                    <select
                      aria-label={`Ubah status booking ${item.id}`}
                      value={item.status}
                      disabled={!BOOKING_TRANSITIONS[item.status].length}
                      onChange={(event) =>
                        changeStatus(item.id, event.target.value as BookingStatus)
                      }
                    >
                      <option value={item.status}>{item.status}</option>
                      {BOOKING_TRANSITIONS[item.status].map((status) => (
                        <option value={status} key={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  ) : ["PENDING", "CONFIRMED"].includes(item.status) ? (
                    <button
                      className="button danger small"
                      type="button"
                      onClick={() => changeStatus(item.id, "CANCELLED")}
                    >
                      Batalkan
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {!bookings.length && (
              <tr>
                <td colSpan={6} className="empty-cell">
                  Belum ada booking.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
