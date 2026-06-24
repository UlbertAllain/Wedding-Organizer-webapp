"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, X } from "lucide-react";

type Vendor = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number | null;
  contact: string | null;
  image: string | null;
  isActive: boolean;
};

const categories = ["KATERING", "DEKORASI", "FOTOGRAFI", "VIDEOGRAFI", "ENTERTAINMENT", "MAKEUP", "VENUE", "LAINNYA"];

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "KATERING",
    description: "",
    price: 0,
    contact: "",
    image: "",
    isActive: true,
  });

  const fetchVendors = async () => {
    try {
      const res = await fetch("/api/vendors");
      const data = await res.json();
      if (Array.isArray(data)) setVendors(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const openAddModal = () => {
    setEditingVendor(null);
    setFormData({ name: "", category: "KATERING", description: "", price: 0, contact: "", image: "", isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      category: vendor.category,
      description: vendor.description || "",
      price: vendor.price || 0,
      contact: vendor.contact || "",
      image: vendor.image || "",
      isActive: vendor.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        price: formData.price ? Number(formData.price) : null,
        description: formData.description || null,
        contact: formData.contact || null,
        image: formData.image || null,
      };

      let res;
      if (editingVendor) {
        res = await fetch(`/api/vendors/${editingVendor.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/vendors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

            if (res?.ok) {
        setIsModalOpen(false);
        fetchVendors();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Gagal menyimpan vendor");
      }
    } catch (error) {
      alert("Terjadi kesalahan server");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menonaktifkan vendor ini?")) return;
    try {
      const res = await fetch(`/api/vendors/${id}`, { method: "DELETE" });
      if (res.ok) fetchVendors();
    } catch (error) {
      alert("Gagal menghapus");
    }
  };

  const formatRupiah = (num: number | null) => {
    if (!num) return "-";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl text-dark-900">Kelola Vendor</h1>
          <p className="text-gray-500 mt-1">Master data vendor mitra WO Anda</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-2 bg-gold-400 hover:bg-gold-500 text-dark-900 font-semibold text-sm tracking-wider uppercase transition-all rounded-sm">
          <Plus size={16} /> Tambah Vendor
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold-500" size={32} /></div>
      ) : (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Nama</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Harga</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Kontak</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-dark-900">{vendor.name}</td>
                  <td className="py-4 px-6"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-sm text-xs font-semibold">{vendor.category}</span></td>
                  <td className="py-4 px-6 text-dark-900">{formatRupiah(vendor.price)}</td>
                  <td className="py-4 px-6 text-gray-600 text-sm">{vendor.contact || "-"}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${vendor.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {vendor.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex gap-2">
                    <button onClick={() => openEditModal(vendor)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-sm transition-colors"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(vendor.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-sm transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-dark-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="font-serif text-xl text-dark-900">{editingVendor ? "Edit Vendor" : "Tambah Vendor Baru"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-dark-900"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Nama Vendor</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:border-gold-400 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Kategori</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:border-gold-400 outline-none bg-white">
                  {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Deskripsi (Opsional)</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:border-gold-400 outline-none"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Harga (Opsional)</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:border-gold-400 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">No. Kontak (Opsional)</label>
                  <input type="text" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:border-gold-400 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">URL Gambar (Opsional)</label>
                <input type="text" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:border-gold-400 outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-gold-400 border-gray-300 rounded" />
                <label className="text-sm text-dark-700">Vendor Aktif</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-600 hover:text-dark-900 text-sm">Batal</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-gold-400 hover:bg-gold-500 text-dark-900 font-semibold text-sm tracking-wider rounded-sm disabled:opacity-50">
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}