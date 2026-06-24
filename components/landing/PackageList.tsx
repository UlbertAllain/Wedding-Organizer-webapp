"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";

type Package = {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string;
};

export default function PackageList() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch("/api/packages");
        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          setPackages(data);
        } else {
          setPackages([]);
          setErrorMsg("Gagal memuat paket dari server.");
        }
      } catch (error) {
        setPackages([]);
        setErrorMsg("Tidak bisa terhubung ke server.");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  };

  return (
    <section id="packages" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-gold-500 tracking-[0.2em] uppercase text-sm font-semibold mb-3">Paket Kami</p>
          <h2 className="font-serif text-4xl md:text-5xl text-dark-900">Pilih Paket Pernikahan Anda</h2>
          <div className="w-24 h-0.5 bg-gold-400 mx-auto mt-6"></div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-gold-500 mr-3" size={32} />
            <span className="text-gray-500">Memuat paket...</span>
          </div>
        ) : errorMsg ? (
          <div className="text-center text-red-500">{errorMsg}</div>
        ) : packages.length === 0 ? (
          <div className="text-center text-gray-500">Belum ada paket tersedia saat ini.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => {
              const features: string[] = pkg.features ? JSON.parse(pkg.features) : [];
              const isMiddle = index === 1; // Paket Gold di tengah biar ke-highlight

              return (
                <div 
                  key={pkg.id} 
                  className={`relative bg-white rounded-sm shadow-sm p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border ${
                    isMiddle ? "border-gold-400 scale-105 shadow-xl" : "border-gray-100"
                  }`}
                >
                  {isMiddle && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold-400 text-dark-900 text-xs font-bold uppercase tracking-widest px-4 py-1">
                      Populer
                    </div>
                  )}
                  
                  <h3 className="font-serif text-2xl text-dark-900 mb-2">{pkg.name}</h3>
                  <p className="text-gray-500 text-sm mb-6 min-h-[40px]">{pkg.description}</p>
                  
                  <div className="mb-8">
                    <span className="font-serif text-4xl text-gold-500">{formatRupiah(pkg.price)}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {features.map((feat, i) => (
                      <li key={i} className="flex items-start text-gray-600 text-sm">
                        <Check className="w-4 h-4 text-gold-400 mr-3 mt-0.5 flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/register"
                    className={`block text-center py-3 tracking-wider uppercase text-sm font-semibold transition-all duration-300 ${
                      isMiddle
                        ? "bg-gold-400 text-dark-900 hover:bg-gold-500"
                        : "border border-gold-400 text-gold-500 hover:bg-gold-400 hover:text-dark-900"
                    }`}
                  >
                    Pilih Paket
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}