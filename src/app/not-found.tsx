import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <span className="eyebrow">404</span>
        <h1>Halaman tidak ditemukan.</h1>
        <p className="muted">
          Alamat yang dibuka tidak tersedia atau sudah dipindahkan.
        </p>
        <Link className="button primary" href="/dashboard">
          Kembali ke dashboard
        </Link>
      </section>
    </main>
  );
}
