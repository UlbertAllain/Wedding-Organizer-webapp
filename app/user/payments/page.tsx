"use client";

import { useEffect, useState } from "react";
import { Loader2, CreditCard } from "lucide-react";

type Booking = {
  id: string;
  status: string;
  totalPrice: number;
  package: { name: string };
};

export default function UserPaymentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

    const fetchBookings = () => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => {
        // Validasi: Kalau bukan Array, set ke array kosong
        if (Array.isArray(data)) {
          setBookings(data);
        } else {
          setBookings([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setBookings([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePay = async (bookingId: string) => {
    setPayingId(bookingId);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();

      if (res.ok && data.snapUrl) {
        // Redirect ke halaman pembayaran Midtrans
        window.open(data.snapUrl, "_blank");
      } else {
        alert(data.message || "Gagal memulai pembayaran");
      }
    } catch (error) {
      alert("Terjadi kesalahan server");
    } finally {
      setPayingId(null);
    }
  };

  const formatRupiah = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);

  // Filter booking yang confirmed aja yang bisa dibayar
  const confirmedBookings = bookings.filter(b => b.status === "CONFIRMED");

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-dark-900">Pembayaran</h1>
        <p className="text-gray-500 mt-1">Selesaikan pembayaran untuk booking yang sudah disetujui</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-gold-500" size={32} /></div>
      ) : confirmedBookings.length === 0 ? (
        <div className="bg-white p-12 rounded-sm shadow-sm text-center">
          <p className="text-gray-500">Belum ada tagihan pembayaran saat ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {confirmedBookings.map((booking) => (
            <div key={booking.id} className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-dark-900 text-lg">{booking.package.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Menunggu pembayaran</p>
              </div>
              <div className="flex items-center gap-6">
                <p className="text-xl font-bold text-gold-500">{formatRupiah(booking.totalPrice)}</p>
                <button 
                  onClick={() => handlePay(booking.id)}
                  disabled={payingId === booking.id}
                  className="flex items-center gap-2 px-6 py-3 bg-gold-400 hover:bg-gold-500 text-dark-900 font-bold tracking-wider uppercase text-sm transition-all disabled:opacity-50 rounded-sm"
                >
                  {payingId === booking.id ? <Loader2 className="animate-spin" size={16} /> : <CreditCard size={16} />}
                  Bayar Sekarang
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}