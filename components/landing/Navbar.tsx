"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Tentukan warna teks berdasarkan status scroll
  const textColor = isScrolled ? "text-dark-700 hover:text-gold-500" : "text-white/80 hover:text-gold-300";
  const logoColor = isScrolled ? "text-dark-900" : "text-white";
  const btnBorder = isScrolled 
    ? "border-gold-400 text-gold-500 hover:bg-gold-400 hover:text-white" 
    : "border-white/40 text-white hover:bg-white/10 hover:border-gold-400 hover:text-gold-400";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className={`font-serif text-2xl font-bold transition-colors duration-300 ${logoColor}`}>
            Eternal<span className="text-gold-400">Vows</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`${textColor} transition-colors text-sm tracking-wider uppercase font-medium`}>
              Home
            </Link>
            <Link href="/#about" className={`${textColor} transition-colors text-sm tracking-wider uppercase font-medium`}>
              About
            </Link>
            <Link href="/#packages" className={`${textColor} transition-colors text-sm tracking-wider uppercase font-medium`}>
              Packages
            </Link>
            <Link
              href="/login"
              className={`px-6 py-2 border transition-all rounded-sm text-sm tracking-wider uppercase font-semibold ${btnBorder}`}
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMobileOpen(!isMobileOpen)} className={`md:hidden transition-colors ${logoColor}`}>
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-white shadow-lg border-t">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link href="/" className="block py-2 text-dark-700 hover:text-gold-500 font-medium">Home</Link>
            <Link href="/#about" className="block py-2 text-dark-700 hover:text-gold-500 font-medium">About</Link>
            <Link href="/#packages" className="block py-2 text-dark-700 hover:text-gold-500 font-medium">Packages</Link>
            <Link href="/login" className="block py-2 text-gold-500 font-semibold">Login</Link>
          </div>
        </div>
      )}
    </nav>
  );
}