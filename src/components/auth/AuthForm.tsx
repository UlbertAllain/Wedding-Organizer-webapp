"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { apiRequest } from "@/lib/api-client";
import { firebaseAuth } from "@/lib/firebase/client";

type AuthMode = "login" | "register";

const benefits = [
  "Pantau detail acara dari satu tempat",
  "Simpan keputusan dan percakapan penting",
  "Lihat timeline, tagihan, dan dokumentasi",
];

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setIsError(false);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();

    try {
      const credential =
        mode === "register"
          ? await createUserWithEmailAndPassword(firebaseAuth, email, password)
          : await signInWithEmailAndPassword(firebaseAuth, email, password);

      if (mode === "register") {
        await updateProfile(credential.user, { displayName: name });
      }

      const idToken = await credential.user.getIdToken(true);
      await apiRequest<{ ok: true }>("/api/auth/session", {
        method: "POST",
        body: JSON.stringify({
          idToken,
          ...(mode === "register" ? { name, phone } : {}),
        }),
      });

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Autentikasi gagal.");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    const email = emailRef.current?.value.trim();
    if (!email) {
      setIsError(true);
      setMessage("Isi alamat email terlebih dahulu.");
      return;
    }

    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      setIsError(false);
      setMessage("Tautan pengaturan ulang kata sandi telah dikirim.");
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Pengiriman gagal.");
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-visual">
        <div className="auth-visual-photo" />
        <div className="auth-visual-overlay" />
        <Link href="/" className="auth-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Beranda
        </Link>

        <div className="auth-visual-copy">
          <p className="section-label section-label-light">Wedding workspace</p>
          <h2>Satu tempat untuk menjaga setiap detail tetap terhubung.</h2>
          <ol>
            {benefits.map((benefit, index) => (
              <li key={benefit}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {benefit}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <Link className="auth-wordmark" href="/">
            Wedding Organizer
          </Link>

          <form className="auth-card" onSubmit={submit}>
            <header>
              <p className="section-label">
                {mode === "login" ? "Akses akun" : "Akun klien baru"}
              </p>
              <h1>{mode === "login" ? "Selamat datang kembali." : "Mulai rencana kalian."}</h1>
              <p>
                {mode === "login"
                  ? "Masuk untuk melanjutkan pengelolaan acara."
                  : "Buat akun untuk mulai berkonsultasi dan menyusun detail acara."}
              </p>
            </header>

            {mode === "register" && (
              <div className="auth-field-grid">
                <label>
                  <span>Nama lengkap</span>
                  <input name="name" minLength={2} placeholder="Nama Anda" required />
                </label>
                <label>
                  <span>Nomor telepon</span>
                  <input
                    name="phone"
                    type="tel"
                    minLength={8}
                    placeholder="08xxxxxxxxxx"
                    required
                  />
                </label>
              </div>
            )}

            <label>
              <span>Alamat email</span>
              <input
                ref={emailRef}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nama@email.com"
                required
              />
            </label>

            <label>
              <span>Kata sandi</span>
              <input
                name="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={8}
                placeholder="Minimal 8 karakter"
                required
              />
            </label>

            {message && (
              <p className={`alert${isError ? " error" : ""}`} role="status">
                {message}
              </p>
            )}

            <button className="button button-dark button-large button-full" disabled={busy}>
              {busy ? "Memproses..." : mode === "login" ? "Masuk" : "Buat akun"}
              {!busy && <ArrowRight size={17} aria-hidden="true" />}
            </button>

            {mode === "login" && (
              <button type="button" className="auth-reset" onClick={resetPassword}>
                Lupa kata sandi?
              </button>
            )}

            <p className="auth-switch">
              {mode === "login" ? (
                <>
                  Belum memiliki akun? <Link href="/register">Daftar</Link>
                </>
              ) : (
                <>
                  Sudah memiliki akun? <Link href="/login">Masuk</Link>
                </>
              )}
            </p>
          </form>

          <p className="auth-privacy-note">
            Data acara hanya dapat diakses oleh Anda dan tim organizer yang berwenang.
          </p>
        </div>
      </section>
    </main>
  );
}
