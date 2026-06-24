"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Save, User, Shield } from "lucide-react";

export default function UserProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: (session?.user as any)?.phone || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Profil berhasil diperbarui!");
        updateSession();
      } else {
        alert(data.message || "Gagal update profil");
      }
    } catch (error) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return alert("Password baru dan konfirmasi tidak cocok!");
    }
    if (passwordData.newPassword.length < 6) {
      return alert("Password baru minimal 6 karakter!");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Password berhasil diubah!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        alert(data.message || "Gagal ubah password");
      }
    } catch (error) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-dark-900">Profil Saya</h1>
        <p className="text-gray-500 mt-1">Kelola informasi pribadi dan keamanan akun Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Info */}
        <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <User size={20} className="text-gold-500" />
            <h2 className="font-serif text-xl text-dark-900">Informasi Pribadi</h2>
          </div>
          <form onSubmit={handleProfileSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:border-gold-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Alamat Email</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:border-gold-400 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-gold-400 hover:bg-gold-500 text-dark-900 font-semibold text-sm tracking-wider uppercase transition-all rounded-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Simpan Perubahan
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Shield size={20} className="text-gold-500" />
            <h2 className="font-serif text-xl text-dark-900">Ubah Password</h2>
          </div>
          <form onSubmit={handlePasswordSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Password Saat Ini</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:border-gold-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Password Baru</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:border-gold-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:border-gold-400 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-dark-900 hover:bg-dark-800 text-gold-400 font-semibold text-sm tracking-wider uppercase transition-all rounded-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Shield size={16} />} Ubah Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}