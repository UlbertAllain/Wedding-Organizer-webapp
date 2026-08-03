"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useState } from "react";

import { apiRequest } from "@/lib/api-client";
import { uploadImage } from "@/lib/cloudinary/client";
import { formatDate } from "@/lib/format";
import type { BookingRecord, GalleryRecord, UserRole } from "@/types/domain";

export default function GalleryManager({ role }: { role: UserRole }) {
  const [items, setItems] = useState<GalleryRecord[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const [galleryData, bookingData] = await Promise.all([
      apiRequest<GalleryRecord[]>("/api/gallery"),
      apiRequest<BookingRecord[]>("/api/bookings"),
    ]);
    setItems(galleryData);
    setBookings(bookingData);
  }, []);

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, [load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const file = form.get("image");

    try {
      if (!(file instanceof File) || !file.size) {
        throw new Error("Pilih gambar terlebih dahulu.");
      }

      const media = await uploadImage(file, "gallery");
      await apiRequest("/api/gallery", {
        method: "POST",
        body: JSON.stringify({
          bookingId: String(form.get("bookingId") || "") || null,
          caption: String(form.get("caption") || "") || null,
          ...media,
        }),
      });

      formElement.reset();
      setMessage("Foto berhasil diunggah.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Hapus foto ini?")) return;

    try {
      await apiRequest(`/api/gallery?id=${id}`, { method: "DELETE" });
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed");
    }
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Dokumentasi</span>
          <h1>Galeri</h1>
          <p>
            Simpan dokumentasi umum maupun koleksi khusus untuk setiap pasangan
            dalam galeri yang rapi dan mudah dicari.
          </p>
        </div>
      </header>

      {message && <p className="alert">{message}</p>}

      {role === "ADMIN" && (
        <form className="panel form-grid" onSubmit={submit}>
          <h2 className="span-full">Unggah dokumentasi</h2>
          <label>
            Booking (opsional)
            <select name="bookingId">
              <option value="">Galeri umum</option>
              {bookings.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.userName} — {formatDate(item.weddingDate)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Gambar
            <input name="image" type="file" accept="image/*" required />
          </label>
          <label className="span-full">
            Caption
            <input name="caption" />
          </label>
          <button className="button primary" disabled={busy}>
            {busy ? "Mengunggah..." : "Unggah"}
          </button>
        </form>
      )}

      <section className="gallery-grid">
        {items.map((item) => (
          <article className="gallery-card" key={item.id}>
            <Image
              src={item.imageUrl}
              alt={item.caption ?? "Wedding documentation"}
              width={800}
              height={600}
            />
            <div>
              <p>{item.caption ?? "Dokumentasi acara"}</p>
              {role === "ADMIN" && (
                <button
                  className="button danger small"
                  type="button"
                  onClick={() => remove(item.id)}
                >
                  Hapus
                </button>
              )}
            </div>
          </article>
        ))}
        {!items.length && <div className="empty-state">Belum ada foto.</div>}
      </section>
    </div>
  );
}
