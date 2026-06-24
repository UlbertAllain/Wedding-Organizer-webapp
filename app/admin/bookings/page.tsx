"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

type Booking = {
  id: string;
  status: string;
  weddingDate: string;
  venue: string;
  totalPrice: number;
  createdAt: string;
  user: { name: string; email: string };
  package: { name: string };
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchBookings(); // Refresh data
      } else {
        alert("Gagal update status");
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatRupiah = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  const formatDate = (date: string) => new Date(date).toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-gold-500" size={32} /></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-dark-900">Manajemen Booking</h1>
        <p className="text-gray-500 mt-1">Kelola permintaan booking dari klien</p>
      </div>

      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Klien</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Paket</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-medium text-dark-900">{booking.user.name}</div>
                    <div className="text-sm text-gray-500">{booking.user.email}</div>
                  </td>
                  <td className="py-4 px-6 text-dark-900">{booking.package.name}</td>
                  <td className="py-4 px-6 text-gray-600">{formatDate(booking.weddingDate)}</td>
                  <td className="py-4 px-6 font-semibold text-dark-900">{formatRupiah(booking.totalPrice)}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                      booking.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                      booking.status === "PAID" ? "bg-green-100 text-green-700" :
                      booking.status === "REJECTED" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {booking.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleStatusUpdate(booking.id, "CONFIRMED")}
                          disabled={updatingId === booking.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded-sm transition-all disabled:opacity-50"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(booking.id, "REJECTED")}
                          disabled={updatingId === booking.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-sm transition-all disabled:opacity-50"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    )}
                    {booking.status !== "PENDING" && (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}