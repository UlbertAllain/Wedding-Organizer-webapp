"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";

type Gallery = {
  id: string;
  image: string;
  caption: string | null;
};

export default function AdminGalleryPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ image: "", caption: "" });

  const fetchGallery = async () => {
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      if (Array.isArray(data)) setGalleries(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataObj = new FormData();
    formDataObj.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formDataObj });
      const data = await res.json();
      if (res.ok) {
        setFormData({ ...formData, image: data.url });
      } else {
        alert("Gagal upload gambar");
      }
    } catch (error) {
      alert("Error upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) return alert("Gambar wajib diupload!");
    setSubmitting(true);

    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ image: "", caption: "" });
        fetchGallery();
      } else {
        alert("Gagal menyimpan");
      }
    } catch (error) {
      alert("Server error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold-500" size={32} /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl text-dark-900">Galeri Portfolio</h1>
          <p className="text-gray-500 mt-1">Upload foto hasil karya pernikahan</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-2 bg-gold-400 hover:bg-gold-500 text-dark-900 font-semibold text-sm tracking-wider uppercase transition-all rounded-sm">
          <Plus size={16} /> Upload Foto
        </button>
      </div>

      {/* Grid Galeri */}
      {galleries.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Belum ada foto di galeri.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleries.map((item) => (
            <div key={item.id} className="relative group aspect-square bg-gray-100 rounded-sm overflow-hidden border border-gray-200">
              <img src={item.image} alt={item.caption || "Gallery"} className="w-full h-full object-cover" />
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-white text-sm truncate">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-dark-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="font-serif text-xl text-dark-900">Upload Foto Baru</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-dark-900"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Pilih Gambar</label>
                <input type="file" accept="image/*" onChange={handleUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-gold-50 file:text-gold-700 hover:file:bg-gold-100" required />
                {uploading && <p className="text-xs text-gold-500 mt-1">Uploading...</p>}
              </div>
              {formData.image && (
                <div className="aspect-video bg-gray-100 rounded-sm overflow-hidden">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Caption (Opsional)</label>
                <input type="text" value={formData.caption} onChange={(e) => setFormData({...formData, caption: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:border-gold-400 outline-none" placeholder="Dekorasi garden party" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-600 hover:text-dark-900 text-sm">Batal</button>
                <button type="submit" disabled={submitting || uploading} className="px-6 py-2 bg-gold-400 hover:bg-gold-500 text-dark-900 font-semibold text-sm tracking-wider rounded-sm disabled:opacity-50">
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