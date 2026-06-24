"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import ChatBox from "@/components/ChatBox";

type Booking = {
  id: string;
  package: { name: string };
};

export default function UserChatPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("/api/bookings");
        const data = await res.json();
        if (Array.isArray(data)) setBookings(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold-500" size={32} /></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-dark-900">Chat & Diskusi</h1>
        <p className="text-gray-500 mt-1">Komunikasi langsung dengan tim WO terkait booking Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List Booking */}
        <div className="lg:col-span-1 bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-cream">
            <h3 className="font-semibold text-dark-900 text-sm">Daftar Booking</h3>
          </div>
          <div className="divide-y">
            {bookings.map((booking) => (
              <button
                key={booking.id}
                onClick={() => setSelectedBooking(booking.id)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                  selectedBooking === booking.id ? "bg-gold-50 border-l-4 border-gold-400" : "border-l-4 border-transparent"
                }`}
              >
                <MessageSquare size={16} className="text-gold-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-dark-900">{booking.package.name}</p>
                  <p className="text-xs text-gray-500 truncate w-40">{booking.id}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Box */}
        <div className="lg:col-span-2">
          {selectedBooking ? (
            <ChatBox key={selectedBooking} bookingId={selectedBooking} />
          ) : (
            <div className="flex items-center justify-center h-[500px] bg-white rounded-sm border border-gray-200 shadow-sm text-gray-400">
              Pilih booking untuk mulai chat
            </div>
          )}
        </div>
      </div>
    </div>
  );
}