"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type Booking = {
  id: string;
  status: string;
  weddingDate: string;
  venue: string;
  totalPrice: number;
  package: { name: string };
};

export default function UserBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("/api/bookings");
        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          setBookings(data);
        } else {
          // Kalau API return error (bukan array), set array kosong & tampilkan pesan
          setBookings([]);
          setErrorMsg(data.message || "Gagal memuat data booking dari server.");
        }
      } catch (error) {
        // Kalau fetch gagal total (misal server down)
        setBookings([]);
        setErrorMsg("Tidak bisa terhubung ke server.");
      } finally {
        // FINALLY: Apapun hasilnya (sukses/error), matiin loading!
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const formatRupiah = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  const formatDate = (date: string) => new Date(date).toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl text-dark-900">Booking Saya</h1>
          <p className="text-gray-500 mt-1">Pantau status booking pernikahan Anda</p>
        </div>
        <Link href="/user/bookings/new" className="px-6 py-2 bg-gold-400 hover:bg-gold-500 text-dark-900 font-semibold text-sm tracking-wider uppercase transition-all rounded-sm">
          + Booking Baru
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-gold-500" size={32} /></div>
      ) : errorMsg ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-sm text-center">
          {errorMsg}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white p-12 rounded-sm shadow-sm text-center">
          <p className="text-gray-500 mb-4">Anda belum memiliki booking.</p>
          <Link href="/user/bookings/new" className="text-gold-500 font-semibold hover:underline">Buat booking pertama Anda →</Link>
        </div>
      ) : (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Paket</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Venue</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-dark-900">{booking.package.name}</td>
                  <td className="py-4 px-6 text-gray-600">{formatDate(booking.weddingDate)}</td>
                  <td className="py-4 px-6 text-gray-600">{booking.venue}</td>
                  <td className="py-4 px-6 font-semibold text-dark-900">{formatRupiah(booking.totalPrice)}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                      booking.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                      booking.status === "PAID" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}