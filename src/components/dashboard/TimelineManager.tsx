"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { apiRequest } from "@/lib/api-client";
import { formatDate, formatDateTime } from "@/lib/format";
import type { BookingRecord, TimelineRecord, UserRole } from "@/types/domain";

export default function TimelineManager({ role }: { role: UserRole }) {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [bookingId, setBookingId] = useState("");
  const [items, setItems] = useState<TimelineRecord[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiRequest<BookingRecord[]>("/api/bookings")
      .then((data) => {
        setBookings(data);
        setBookingId((current) => current || data[0]?.id || "");
      })
      .catch((error) => setMessage(error.message));
  }, []);

  const load = useCallback(async () => {
    if (!bookingId) {
      setItems([]);
      return;
    }

    const data = await apiRequest<TimelineRecord[]>(
      `/api/timeline?bookingId=${bookingId}`,
    );
    setItems(data);
  }, [bookingId]);

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, [load]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    try {
      await apiRequest("/api/timeline", {
        method: "POST",
        body: JSON.stringify({
          bookingId,
          title: String(form.get("title")),
          description: String(form.get("description") || "") || null,
          eventTime: new Date(String(form.get("eventTime"))).toISOString(),
        }),
      });
      formElement.reset();
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggleCompleted(item: TimelineRecord) {
    try {
      await apiRequest(`/api/timeline/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          bookingId,
          isCompleted: !item.isCompleted,
        }),
      });
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Update failed");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Hapus agenda timeline ini?")) return;

    try {
      await apiRequest(`/api/timeline/${id}?bookingId=${bookingId}`, {
        method: "DELETE",
      });
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed");
    }
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Pelaksanaan</span>
          <h1>Timeline acara</h1>
          <p>
            Susun agenda penting per booking agar klien dan tim organizer selalu
            melihat urutan pelaksanaan yang sama.
          </p>
        </div>
      </header>

      {message && <p className="alert">{message}</p>}

      <section className="panel form-grid compact-form">
        <label className="span-full">
          Pilih booking
          <select
            value={bookingId}
            onChange={(event) => setBookingId(event.target.value)}
          >
            <option value="">Belum ada booking</option>
            {bookings.map((item) => (
              <option key={item.id} value={item.id}>
                {item.userName} — {formatDate(item.weddingDate)} — {item.packageName}
              </option>
            ))}
          </select>
        </label>
      </section>

      {role === "ADMIN" && bookingId && (
        <form className="panel form-grid" onSubmit={create}>
          <h2 className="span-full">Tambah agenda</h2>
          <label>
            Judul
            <input name="title" required />
          </label>
          <label>
            Waktu
            <input type="datetime-local" name="eventTime" required />
          </label>
          <label className="span-full">
            Deskripsi
            <textarea name="description" />
          </label>
          <button className="button primary" disabled={busy}>
            {busy ? "Menyimpan..." : "Tambah agenda"}
          </button>
        </form>
      )}

      <section className="timeline-list">
        {items.map((item) => (
          <article
            className={`timeline-item ${item.isCompleted ? "done" : ""}`}
            key={item.id}
          >
            <div className="timeline-marker" />
            <div>
              <span className="eyebrow">{formatDateTime(item.eventTime)}</span>
              <h3>{item.title}</h3>
              <p>{item.description ?? "Tanpa deskripsi."}</p>
              {role === "ADMIN" && (
                <div className="row gap">
                  <button
                    className="button secondary small"
                    type="button"
                    onClick={() => toggleCompleted(item)}
                  >
                    {item.isCompleted ? "Buka kembali" : "Tandai selesai"}
                  </button>
                  <button
                    className="button danger small"
                    type="button"
                    onClick={() => remove(item.id)}
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
        {bookingId && !items.length && (
          <div className="empty-state">Timeline belum dibuat.</div>
        )}
      </section>
    </div>
  );
}
