"use client";

import { LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { firebaseAuth } from "@/lib/firebase/client";

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);

    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      await signOut(firebaseAuth).catch(() => undefined);
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <button
      className="nav-link danger"
      type="button"
      disabled={busy}
      onClick={logout}
    >
      <LogOut size={18} />
      {busy ? "Keluar..." : "Keluar"}
    </button>
  );
}
