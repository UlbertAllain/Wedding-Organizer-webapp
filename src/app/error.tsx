"use client";

import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const message =
    process.env.NODE_ENV === "development"
      ? error.message
      : "Periksa konfigurasi atau coba ulang.";

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <span className="eyebrow">System error</span>
        <h1>Permintaan tidak dapat diselesaikan.</h1>
        <p className="muted">{message}</p>
        <button className="button primary" type="button" onClick={reset}>
          Coba ulang
        </button>
        <Link className="button secondary" href="/dashboard">
          Kembali ke dashboard
        </Link>
      </section>
    </main>
  );
}
