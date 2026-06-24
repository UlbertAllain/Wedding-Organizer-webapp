"use client";

import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import { useSession } from "next-auth/react";
import { Loader2, Send } from "lucide-react";

type Message = {
  id: string;
  senderId: string;
  message: string;
  createdAt: string;
  senderName?: string;
};

export default function ChatBox({ bookingId }: { bookingId: string }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch pesan lama saat pertama buka
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat?bookingId=${bookingId}`);
        const data = await res.json();
        if (Array.isArray(data)) setMessages(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [bookingId]);

  // Setup Pusher untuk real-time
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: "/api/pusher/auth",
    });

    const channel = pusher.subscribe(`private-chat-${bookingId}`);

    channel.bind("new-message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      pusher.unsubscribe(`private-chat-${bookingId}`);
      pusher.disconnect();
    };
  }, [bookingId]);

  // Auto-scroll ke bawah kalau ada pesan baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, message: newMessage }),
      });

      if (res.ok) {
        setNewMessage(""); // Kosongkan input kalau sukses
      }
    } catch (error) {
      alert("Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  const currentUser = (session?.user as any)?.id;

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gold-500" size={24} /></div>;
  }

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-sm border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-cream">
        <h3 className="font-semibold text-dark-900">Chat Booking</h3>
        <p className="text-xs text-gray-500">Diskusi detail pernikahan Anda</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm">Belum ada pesan. Mulai percakapan!</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <span className="text-xs text-gray-500 mb-1">{isMe ? "Anda" : msg.senderName || "Admin"}</span>
              <div className={`max-w-[75%] px-4 py-2 rounded-sm text-sm shadow-sm ${
                isMe 
                  ? "bg-gold-400 text-dark-900" 
                  : "bg-white text-dark-900 border border-gray-200"
              }`}>
                {msg.message}
              </div>
              <span className="text-[10px] text-gray-400 mt-1">
                {new Date(msg.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="flex items-center gap-2 p-4 border-t bg-white">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 px-4 py-2 border border-gray-200 rounded-sm focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none text-sm"
          required
        />
        <button
          type="submit"
          disabled={sending}
          className="p-2 bg-dark-900 hover:bg-dark-800 text-gold-400 rounded-sm transition-colors disabled:opacity-50"
        >
          {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </form>
    </div>
  );
}