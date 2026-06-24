"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Email atau password salah!");
      } else {
        const response = await fetch("/api/auth/session");
        const session = await response.json();
        
        if (session?.user?.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/user/dashboard");
        }
      }
    } catch (err) {
      setError("Terjadi kesalahan server");
    } finally {
      // FINALLY: Apapun hasilnya (sukses/error), tombol pasti bisa diklik lagi!
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Kiri - Branding / Gambar */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-dark-900/60 flex flex-col justify-center items-center p-12">
          <h1 className="font-serif text-5xl text-white mb-4 text-center">
            Eternal<span className="text-gold-400">Vows</span>
          </h1>
          <p className="text-gray-300 text-center max-w-md">
            Wujudkan pernikahan impian Anda bersama kami. Masuk untuk melihat progress dan mengelola acara Anda.
          </p>
        </div>
      </div>

      {/* Kanan - Form Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-cream p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="font-serif text-2xl font-bold text-dark-900 lg:hidden">
              Eternal<span className="text-gold-400">Vows</span>
            </Link>
            <h2 className="font-serif text-3xl mt-6 mb-2">Selamat Datang Kembali</h2>
            <p className="text-gray-500">Silakan masuk ke akun Anda</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-sm mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Alamat Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-colors bg-white"
                placeholder="name@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-colors bg-white"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-dark-900 hover:bg-dark-800 text-white tracking-widest uppercase text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Belum punya akun?{" "}
            <Link href="/register" className="text-gold-500 hover:text-gold-600 font-semibold">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}