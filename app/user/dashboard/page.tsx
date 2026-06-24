"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CalendarCheck, Wallet, Clock } from "lucide-react";
import Link from "next/link";

type Booking = {
  id: string;
  status: string;
  weddingDate: string;
  venue: string;
  totalPrice: number;
  package: {
    name: string;
  };
};

export default function UserDashboard() {
  const { data: session } = useSession();
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

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Statistik sederhana
  const activeBookings = bookings.filter(b => b.status !== "COMPLETED" && b.status !== "CANCELLED").length;
  const pendingPayments = bookings.filter(b => b.status === "CONFIRMED").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-dark-900">Selamat Datang, {session?.user?.name || "User"} 👋</h1>
        <p className="text-gray-500 mt-1">Persiapkan hari istimewa Anda dari sini.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Active Bookings</p>
            <h3 className="text-2xl font-bold text-dark-900">{activeBookings}</h3>
          </div>
          <div className="p-3 bg-gold-50 rounded-sm">
            <CalendarCheck className="text-gold-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Pending Payments</p>
            <h3 className="text-2xl font-bold text-dark-900">{pendingPayments}</h3>
          </div>
          <div className="p-3 bg-red-50 rounded-sm">
            <Wallet className="text-red-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Next Event</p>
            <h3 className="text-lg font-bold text-dark-900">
              {bookings.length > 0 ? formatDate(bookings[0].weddingDate) : "No events"}
            </h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-sm">
            <Clock className="text-blue-500" size={24} />
          </div>
        </div>
      </div>

      {/* Quick Action & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Action */}
        <div className="bg-dark-900 p-8 rounded-sm shadow-sm text-white flex flex-col justify-center">
          <h2 className="font-serif text-2xl mb-4">Siap Memulai?</h2>
          <p className="text-gray-400 text-sm mb-6">Pilih paket pernikahan impian Anda dan mulai perencanaan hari bahagia Anda bersama kami.</p>
          <Link 
            href="/user/bookings" 
            className="block text-center py-3 bg-gold-400 hover:bg-gold-500 text-dark-900 font-semibold tracking-widest uppercase text-sm transition-all"
          >
            Buat Booking Baru
          </Link>
        </div>

        {/* Recent Bookings List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-sm shadow-sm border border-gray-100">
          <h2 className="font-serif text-xl text-dark-900 mb-4">Booking Terbaru Anda</h2>
          
          {loading ? (
            <p className="text-gray-400 text-center py-4">Memuat data...</p>
          ) : bookings.length === 0 ? (
            <p className="text-gray-400 text-center py-10">Anda belum memiliki booking.</p>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-cream rounded-sm border border-gray-100">
                  <div>
                    <h4 className="font-semibold text-dark-900">{booking.package.name}</h4>
                    <p className="text-sm text-gray-500">{formatDate(booking.weddingDate)} • {booking.venue}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gold-600">{formatRupiah(booking.totalPrice)}</p>
                    <span className={`text-xs px-2 py-1 rounded-sm ${
                      booking.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                      booking.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                      booking.status === "PAID" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}