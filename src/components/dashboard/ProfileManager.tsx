"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { apiRequest } from "@/lib/api-client";
import { uploadImage } from "@/lib/cloudinary/client";
import type { UserProfile } from "@/types/domain";

export default function ProfileManager({ user }: { user: UserProfile }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const file = form.get("avatar");

    try {
      const media =
        file instanceof File && file.size
          ? await uploadImage(file, "avatars")
          : {
              imageUrl: user.avatarUrl,
              imagePublicId: user.avatarPublicId,
            };

      await apiRequest("/api/users/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: String(form.get("name")),
          phone: String(form.get("phone") || "") || null,
          avatarUrl: media.imageUrl,
          avatarPublicId: media.imagePublicId,
        }),
      });

      setMessage("Profil diperbarui.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Akun</span>
          <h1>Profil</h1>
          <p>
            Perbarui identitas, kontak, dan foto profil yang digunakan di seluruh
            ruang kerja.
          </p>
        </div>
      </header>

      {message && <p className="alert">{message}</p>}

      <form className="panel form-grid" onSubmit={submit}>
        <label>
          Nama
          <input name="name" defaultValue={user.name} required />
        </label>
        <label>
          Email
          <input value={user.email} disabled />
        </label>
        <label>
          Telepon
          <input name="phone" defaultValue={user.phone ?? ""} />
        </label>
        <label>
          Role
          <input value={user.role} disabled />
        </label>
        <label className="span-full">
          Avatar
          <input name="avatar" type="file" accept="image/*" />
        </label>
        <button className="button primary" disabled={busy}>
          {busy ? "Menyimpan..." : "Simpan profil"}
        </button>
      </form>
    </div>
  );
}
