"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal mendaftar");
        setLoading(false);
        return;
      }

      // Kalau sukses daftar, langsung lempar ke halaman login
      router.push("/login");
    } catch (err) {
      setError("Terjadi kesalahan server");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Kiri - Branding / Gambar */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-dark-900/60 flex flex-col justify-center items-center p-12">
          <h1 className="font-serif text-5xl text-white mb-4 text-center">
            Mulai Perjalanan Anda
          </h1>
          <p className="text-gray-300 text-center max-w-md">
            Bergabunglah dan wujudkan pernikahan impian Anda bersama EternalVows.
          </p>
        </div>
      </div>

      {/* Kanan - Form Register */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-cream p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="font-serif text-2xl font-bold text-dark-900 lg:hidden">
              Eternal<span className="text-gold-400">Vows</span>
            </Link>
            <h2 className="font-serif text-3xl mt-6 mb-2">Buat Akun Baru</h2>
            <p className="text-gray-500">Isi data Anda untuk memulai</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-sm mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-colors bg-white"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Alamat Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-colors bg-white"
                placeholder="name@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Nomor WhatsApp</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-colors bg-white"
                placeholder="081234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-colors bg-white"
                placeholder="Minimal 6 karakter"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-dark-900 hover:bg-dark-800 text-white tracking-widest uppercase text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-gold-500 hover:text-gold-600 font-semibold">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}