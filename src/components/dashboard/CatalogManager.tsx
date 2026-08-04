"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { apiRequest } from "@/lib/api-client";
import { uploadImage } from "@/lib/cloudinary/client";
import { formatCurrency } from "@/lib/format";
import type { PackageRecord, VendorRecord } from "@/types/domain";

type CatalogMode = "packages" | "vendors";
type CatalogRecord = PackageRecord | VendorRecord;

export default function CatalogManager({ mode }: { mode: CatalogMode }) {
  const [items, setItems] = useState<CatalogRecord[]>([]);
  const [editing, setEditing] = useState<CatalogRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const label = mode === "packages" ? "Paket" : "Vendor";

  const load = useCallback(
    () => apiRequest<CatalogRecord[]>(`/api/${mode}`).then(setItems),
    [mode],
  );

  useEffect(() => {
    let cancelled = false;

    apiRequest<CatalogRecord[]>(`/api/${mode}`)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Load failed");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const image = form.get("image");

    try {
      const media =
        image instanceof File && image.size ? await uploadImage(image, mode) : null;
      const common = {
        name: String(form.get("name")),
        description:
          String(form.get("description") || "") ||
          (mode === "packages" ? "Paket layanan wedding organizer." : null),
        price: Number(form.get("price") || 0),
        ...(media ?? {}),
        isActive: editing?.isActive ?? true,
      };
      const payload =
        mode === "packages"
          ? {
              ...common,
              features: String(form.get("features"))
                .split("\n")
                .map((value) => value.trim())
                .filter(Boolean),
            }
          : {
              ...common,
              category: String(form.get("category")),
              contact: String(form.get("contact") || "") || null,
            };

      await apiRequest(editing ? `/api/${mode}/${editing.id}` : `/api/${mode}`, {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      setMessage(`${label} berhasil ${editing ? "diperbarui" : "ditambahkan"}.`);
      setEditing(null);
      formElement.reset();
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(item: CatalogRecord) {
    try {
      await apiRequest(`/api/${mode}/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Update failed");
    }
  }

  async function remove(id: string) {
    if (!window.confirm(`Hapus ${label.toLowerCase()} ini?`)) return;
    try {
      await apiRequest(`/api/${mode}/${id}`, { method: "DELETE" });
      if (editing?.id === id) setEditing(null);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed");
    }
  }

  const editingPackage = editing && "features" in editing ? editing : null;
  const editingVendor = editing && "category" in editing ? editing : null;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Master data</span>
          <h1>{label}</h1>
          <p>Susun katalog yang jelas tanpa menghilangkan riwayat layanan lama.</p>
        </div>
      </header>
      {message && <p className="alert">{message}</p>}

      <form
        className="panel form-grid"
        key={editing?.id ?? "new"}
        onSubmit={submit}
      >
        <h2 className="span-full">
          {editing ? `Edit ${label.toLowerCase()}` : `Tambah ${label.toLowerCase()}`}
        </h2>
        <label>
          Nama
          <input name="name" defaultValue={editing?.name ?? ""} required minLength={2} />
        </label>
        {mode === "vendors" && (
          <label>
            Kategori
            <input name="category" defaultValue={editingVendor?.category ?? ""} required />
          </label>
        )}
        <label>
          Harga
          <input name="price" type="number" min={mode === "packages" ? 1 : 0} defaultValue={editing?.price ?? ""} required />
        </label>
        {mode === "vendors" && (
          <label>
            Kontak
            <input name="contact" defaultValue={editingVendor?.contact ?? ""} />
          </label>
        )}
        <label className="span-full">
          Deskripsi
          <textarea name="description" defaultValue={editing?.description ?? ""} required={mode === "packages"} />
        </label>
        {mode === "packages" && (
          <label className="span-full">
            Fitur (satu per baris)
            <textarea
              name="features"
              defaultValue={editingPackage?.features.join("\n") ?? ""}
              required
            />
          </label>
        )}
        <label className="span-full">
          Gambar {editing ? "baru (opsional)" : "(opsional)"}
          <input name="image" type="file" accept="image/*" />
        </label>
        <div className="row gap">
          <button className="button primary" disabled={busy}>
            {busy
              ? "Menyimpan..."
              : editing
                ? "Simpan perubahan"
                : `Tambah ${label.toLowerCase()}`}
          </button>
          {editing && (
            <button
              className="button secondary"
              type="button"
              onClick={() => setEditing(null)}
            >
              Batal
            </button>
          )}
        </div>
      </form>

      <section className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Jenis</th>
              <th>Harga</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                  <span>{item.description}</span>
                </td>
                <td>
                  {"category" in item
                    ? item.category
                    : `${item.features.length} fitur`}
                </td>
                <td>{formatCurrency(item.price ?? 0)}</td>
                <td>
                  <span
                    className={`badge ${
                      item.isActive ? "confirmed" : "cancelled"
                    }`}
                  >
                    {item.isActive ? "AKTIF" : "NONAKTIF"}
                  </span>
                </td>
                <td>
                  <div className="row gap wrap">
                    <button
                      className="button secondary small"
                      onClick={() => setEditing(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="button secondary small"
                      onClick={() => toggle(item)}
                    >
                      {item.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                    <button
                      className="button danger small"
                      onClick={() => remove(item.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td className="empty-cell" colSpan={5}>
                  Belum ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
