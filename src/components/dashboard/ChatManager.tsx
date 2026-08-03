"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { apiRequest } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type {
  BookingRecord,
  ChatMessageRecord,
  UserProfile,
} from "@/types/domain";

const POLLING_INTERVAL_MS = 5_000;

export default function ChatManager({ user }: { user: UserProfile }) {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [bookingId, setBookingId] = useState("");
  const [messages, setMessages] = useState<ChatMessageRecord[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<BookingRecord[]>("/api/bookings")
      .then((data) => {
        setBookings(data);
        setBookingId((current) => current || data[0]?.id || "");
      })
      .catch((caught) => setError(caught.message));
  }, []);

  const loadMessages = useCallback(async () => {
    if (!bookingId) {
      setMessages([]);
      return;
    }

    const data = await apiRequest<ChatMessageRecord[]>(
      `/api/chat?bookingId=${bookingId}`,
    );
    setMessages(data);
  }, [bookingId]);

  useEffect(() => {
    loadMessages().catch((caught) => setError(caught.message));
    if (!bookingId) return;

    const timer = window.setInterval(() => {
      loadMessages().catch(() => undefined);
    }, POLLING_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [bookingId, loadMessages]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const message = String(form.get("message") || "").trim();
    if (!message || !bookingId) return;

    try {
      await apiRequest("/api/chat", {
        method: "POST",
        body: JSON.stringify({ bookingId, message }),
      });
      formElement.reset();
      await loadMessages();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Send failed");
    }
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Komunikasi</span>
          <h1>Chat booking</h1>
          <p>
            Semua percakapan terhubung ke booking agar keputusan dan perubahan
            tidak tercecer di banyak kanal.
          </p>
        </div>
      </header>

      {error && <p className="alert error">{error}</p>}

      <section className="chat-layout">
        <aside className="panel booking-list">
          {bookings.map((item) => (
            <button
              className={bookingId === item.id ? "active" : ""}
              type="button"
              onClick={() => setBookingId(item.id)}
              key={item.id}
            >
              <strong>{item.userName}</strong>
              <span>
                {formatDate(item.weddingDate)} · {item.packageName}
              </span>
            </button>
          ))}
          {!bookings.length && <p className="muted">Belum ada booking.</p>}
        </aside>

        <div className="panel chat-panel">
          <div className="messages">
            {messages.map((item) => (
              <div
                className={`message ${item.senderId === user.id ? "mine" : ""}`}
                key={item.id}
              >
                <strong>
                  {item.senderName} · {item.senderRole}
                </strong>
                <p>{item.message}</p>
              </div>
            ))}
            {bookingId && !messages.length && (
              <p className="empty-cell">Belum ada pesan.</p>
            )}
          </div>

          <form className="chat-form" onSubmit={send}>
            <input
              name="message"
              placeholder="Tulis pesan..."
              disabled={!bookingId}
              maxLength={2000}
            />
            <button className="button primary" disabled={!bookingId}>
              Kirim
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
