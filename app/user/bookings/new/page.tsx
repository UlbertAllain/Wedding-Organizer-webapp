"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

type Package = {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string;
};

export default function NewBookingPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); 
  
  const [selectedPkg, setSelectedPkg] = useState<string>("");
  const [formData, setFormData] = useState({
    weddingDate: "",
    venue: "",
    theme: "",
    guestCount: 100,
    notes: "",
  });

  useEffect(() => {
    fetch("/api/packages")
      .then((res) => res.json())
      .then((data) => {
        setPackages(data);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg) {
      setErrorMsg("Pilih paket terlebih dahulu!");
      return;
    }

    setSubmitting(true);
    setErrorMsg(""); // Reset error

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: selectedPkg,
          ...formData,
          weddingDate: new Date(formData.weddingDate).toISOString(),
          guestCount: Number(formData.guestCount),
        }),
      });

      if (res.ok) {
        router.push("/user/bookings");
      } else {
        const data = await res.json();
        setErrorMsg(data.message || "Gagal membuat booking"); // <--- Tangkap pesan error dari backend
      }
    } catch (error) {
      setErrorMsg("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-gold-500" size={32} /></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-dark-900">Buat Booking Baru</h1>
        <p className="text-gray-500 mt-1">Pilih paket dan isi detail pernikahan Anda</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Pilih Paket */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
            <h2 className="font-serif text-xl text-dark-900 mb-4">1. Pilih Paket</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packages.map((pkg) => {
                const features: string[] = pkg.features ? JSON.parse(pkg.features) : [];
                return (
                  <div 
                    key={pkg.id} 
                    onClick={() => setSelectedPkg(pkg.id)}
                    className={`relative cursor-pointer border-2 p-4 rounded-sm transition-all hover:shadow-md ${
                      selectedPkg === pkg.id ? "border-gold-400 bg-gold-50/50" : "border-gray-200 bg-white"
                    }`}
                  >
                    {selectedPkg === pkg.id && (
                      <div className="absolute top-2 right-2 bg-gold-400 rounded-full p-1">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                    <h3 className="font-semibold text-dark-900">{pkg.name}</h3>
                    <p className="text-gold-500 font-bold mt-1">{formatRupiah(pkg.price)}</p>
                    <ul className="mt-2 space-y-1">
                      {features.slice(0, 3).map((f, i) => (
                        <li key={i} className="text-xs text-gray-500 flex items-start gap-1">
                          <Check size={10} className="mt-0.5 text-gold-400 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
            <h2 className="font-serif text-xl text-dark-900 mb-4">2. Detail Pernikahan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Tanggal Pernikahan</label>
                <input 
                  type="date" 
                  name="weddingDate"
                  value={formData.weddingDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none bg-white rounded-sm"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Tempat/Venue</label>
                <input 
                  type="text" 
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="e.g. Hotel Mulia Jakarta"
                  className="w-full px-4 py-3 border border-gray-200 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none bg-white rounded-sm"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Tema Pernikahan</label>
                <input 
                  type="text" 
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  placeholder="e.g. Rustic Garden"
                  className="w-full px-4 py-3 border border-gray-200 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none bg-white rounded-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Jumlah Tamu</label>
                <input 
                  type="number" 
                  name="guestCount"
                  value={formData.guestCount}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none bg-white rounded-sm"
                  required 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark-700 mb-2">Catatan Tambahan</label>
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Permintaan khusus atau catatan untuk WO..."
                  className="w-full px-4 py-3 border border-gray-200 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none bg-white rounded-sm"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Summary & Submit */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 sticky top-8">
            <h2 className="font-serif text-xl text-dark-900 mb-4">Ringkasan</h2>
            
                        {selectedPkg ? (
              <>
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <p className="text-sm text-gray-500">Paket Terpilih</p>
                  <h3 className="text-lg font-bold text-dark-900">
                    {packages.find(p => p.id === selectedPkg)?.name}
                  </h3>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-sm text-gray-500">Total Biaya</p>
                  <p className="text-2xl font-bold text-gold-500">
                    {formatRupiah(packages.find(p => p.id === selectedPkg)?.price || 0)}
                  </p>
                </div>

                {/* TAMPILKAN ERROR KUOTA PENUH DISINI */}
                {errorMsg && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-sm text-red-600 text-sm">
                    <strong className="block mb-1">Jadwal Tidak Tersedia!</strong>
                    {errorMsg}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-3 bg-gold-400 hover:bg-gold-500 text-dark-900 font-bold tracking-widest uppercase text-sm transition-all disabled:opacity-50 rounded-sm"
                >
                  {submitting ? "Memproses..." : "Submit Booking"}
                </button>
              </>
            ) : (
              <p className="text-gray-400 text-sm text-center py-10">Pilih paket terlebih dahulu untuk melihat ringkasan</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}