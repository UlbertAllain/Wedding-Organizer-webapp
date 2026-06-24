"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, X } from "lucide-react";

type Package = {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string;
  image: string | null;
  isActive: boolean;
};

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    features: "", // Input sebagai string dipisah koma, nanti diubah jadi JSON array
    image: "",
    isActive: true,
  });

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/packages");
      const data = await res.json();
      if (Array.isArray(data)) setPackages(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openAddModal = () => {
    setEditingPkg(null);
    setFormData({ name: "", description: "", price: 0, features: "", image: "", isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: Package) => {
    setEditingPkg(pkg);
    // Ubah features dari JSON string jadi string biasa dipisah koma
    const featuresArray = pkg.features ? JSON.parse(pkg.features) : [];
    setFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      features: featuresArray.join(", "),
      image: pkg.image || "",
      isActive: pkg.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Ubah string biasa "Dekorasi, Katering" jadi '["Dekorasi", "Katering"]'
      const featuresJson = JSON.stringify(
        formData.features.split(",").map((f) => f.trim()).filter((f) => f !== "")
      );

      const payload = {
        ...formData,
        price: Number(formData.price),
        features: featuresJson,
      };

      let res;
      if (editingPkg) {
        // UPDATE
        res = await fetch(`/api/packages/${editingPkg.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // CREATE
        res = await fetch("/api/packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res?.ok) {
        setIsModalOpen(false);
        fetchPackages();
      } else {
        alert("Gagal menyimpan paket");
      }
    } catch (error) {
      alert("Terjadi kesalahan server");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menonaktifkan paket ini?")) return;
    try {
      const res = await fetch(`/api/packages/${id}`, { method: "DELETE" });
      if (res.ok) fetchPackages();
    } catch (error) {
      alert("Gagal menghapus");
    }
  };

  const formatRupiah = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl text-dark-900">Kelola Paket</h1>
          <p className="text-gray-500 mt-1">Buat, edit, dan nonaktifkan paket pernikahan</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-2 bg-gold-400 hover:bg-gold-500 text-dark-900 font-semibold text-sm tracking-wider uppercase transition-all rounded-sm">
          <Plus size={16} /> Tambah Paket
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold-500" size={32} /></div>
      ) : (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Nama</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Harga</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-dark-900">{pkg.name}</td>
                  <td className="py-4 px-6 text-dark-900">{formatRupiah(pkg.price)}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${pkg.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {pkg.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex gap-2">
                    <button onClick={() => openEditModal(pkg)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-sm transition-colors">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(pkg.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-sm transition-colors">
                      <Trash2 size={16} />
                    </button>
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
              <h2 className="font-serif text-xl text-dark-900">{editingPkg ? "Edit Paket" : "Tambah Paket Baru"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-dark-900"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Nama Paket</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:border-gold-400 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Deskripsi</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:border-gold-400 outline-none" required></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Harga (IDR)</label>
                <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:border-gold-400 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Fitur (Pisahkan dengan koma)</label>
                <input type="text" placeholder="Dekorasi, Katering, Foto" value={formData.features} onChange={(e) => setFormData({...formData, features: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:border-gold-400 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">URL Gambar (Opsional)</label>
                <input type="text" placeholder="https://..." value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:border-gold-400 outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-gold-400 border-gray-300 rounded focus:ring-gold-400" />
                <label className="text-sm text-dark-700">Paket Aktif</label>
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