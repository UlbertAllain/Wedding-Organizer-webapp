"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  Check,
  Heart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { apiRequest } from "@/lib/api-client";
import { firebaseAuth } from "@/lib/firebase/client";

type AuthMode = "login" | "register";

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
      setMessage(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    const email = emailRef.current?.value.trim();
    if (!email) {
      setIsError(true);
      setMessage("Isi email terlebih dahulu.");
      return;
    }

    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      setIsError(false);
      setMessage("Tautan reset kata sandi telah dikirim.");
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Reset failed");
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-showcase">
        <Link href="/" className="auth-back-link">
          <ArrowLeft size={16} /> Kembali ke beranda
        </Link>

        <div className="auth-showcase-copy">
          <span className="auth-ornament">
            <Heart size={18} />
          </span>
          <span className="eyebrow light">Wedding operations suite</span>
          <h2>Rencana yang indah dimulai dari sistem yang tenang.</h2>
          <p>
            Booking, vendor, timeline, pembayaran, galeri, dan komunikasi berada
            dalam satu ruang kerja yang sama.
          </p>
          <div className="auth-benefit-list">
            <div>
              <CalendarCheck2 size={18} />
              <span>Jadwal dan progress acara selalu terbaca</span>
            </div>
            <div>
              <ShieldCheck size={18} />
              <span>Akses admin dan klien terpisah secara aman</span>
            </div>
            <div>
              <Sparkles size={18} />
              <span>Media dan detail pernikahan tersimpan terpusat</span>
            </div>
          </div>
        </div>

        <div className="auth-showcase-footer">
          <span>PLAN</span>
          <i />
          <span>COLLABORATE</span>
          <i />
          <span>CELEBRATE</span>
        </div>
      </section>

      <section className="auth-form-side">
        <form className="auth-card" onSubmit={submit}>
          <div className="auth-card-heading">
            <span className="auth-mini-mark">WO</span>
            <div>
              <span className="eyebrow">
                {mode === "login" ? "Welcome back" : "Create workspace access"}
              </span>
              <h1>{mode === "login" ? "Masuk ke akun Anda" : "Buat akun klien"}</h1>
              <p>
                {mode === "login"
                  ? "Lanjutkan pengelolaan acara dari dashboard."
                  : "Mulai susun rencana pernikahan dalam satu ruang kerja."}
              </p>
            </div>
          </div>

          {mode === "register" && (
            <div className="auth-two-column">
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

          <button className="button primary full auth-submit" disabled={busy}>
            {busy ? "Memproses..." : mode === "login" ? "Masuk ke dashboard" : "Buat akun"}
            {!busy && <ArrowRight size={17} />}
          </button>

          {mode === "login" && (
            <button type="button" className="auth-reset" onClick={resetPassword}>
              Lupa kata sandi?
            </button>
          )}

          <div className="auth-divider">
            <span />
            <small>AKSES AMAN FIREBASE</small>
            <span />
          </div>

          <p className="auth-switch">
            {mode === "login" ? (
              <>
                Belum memiliki akun? <Link href="/register">Daftar sekarang</Link>
              </>
            ) : (
              <>
                Sudah memiliki akun? <Link href="/login">Masuk di sini</Link>
              </>
            )}
          </p>

          <div className="auth-secure-note">
            <Check size={15} />
            <span>Session tersimpan melalui cookie HttpOnly yang aman.</span>
          </div>
        </form>
      </section>
    </div>
  );
}
