"use client";

import { useEffect, useState } from "react";
import { Loader2, Wallet } from "lucide-react";

type Payment = {
  id: string;
  amount: number;
  midtransOrderId: string | null;
  status: string;
  createdAt: string;
  paidAt: string | null;
  user: { name: string; email: string };
  booking: { id: string; package: { name: string } };
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch("/api/payments");
        const data = await res.json();
        if (Array.isArray(data)) setPayments(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const formatRupiah = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  const formatDate = (date: string) => new Date(date).toLocaleDateString("id-ID", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Hitung total revenue dari yang PAID
  const totalRevenue = payments.filter(p => p.status === "PAID").reduce((acc, curr) => acc + curr.amount, 0);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold-500" size={32} /></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-dark-900">Riwayat Pembayaran</h1>
        <p className="text-gray-500 mt-1">Pantau transaksi dan status pembayaran klien</p>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold text-dark-900">{formatRupiah(totalRevenue)}</h3>
          </div>
          <div className="p-3 bg-green-50 rounded-sm">
            <Wallet className="text-green-600" size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Transaksi</p>
          <h3 className="text-2xl font-bold text-dark-900">{payments.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Pending</p>
          <h3 className="text-2xl font-bold text-yellow-600">{payments.filter(p => p.status === "PENDING").length}</h3>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Klien</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Paket</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-medium text-dark-900">{payment.user.name}</div>
                    <div className="text-xs text-gray-500">{payment.user.email}</div>
                  </td>
                  <td className="py-4 px-6 text-dark-900">{payment.booking.package.name}</td>
                  <td className="py-4 px-6 text-xs text-gray-600 font-mono">{payment.midtransOrderId || "-"}</td>
                  <td className="py-4 px-6 font-semibold text-dark-900">{formatRupiah(payment.amount)}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      payment.status === "PAID" ? "bg-green-100 text-green-700" :
                      payment.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                      payment.status === "FAILED" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600 text-sm">
                    {payment.paidAt ? formatDate(payment.paidAt) : formatDate(payment.createdAt)}
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