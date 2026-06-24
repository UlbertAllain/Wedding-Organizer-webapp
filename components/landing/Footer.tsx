import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-gray-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="font-serif text-2xl font-bold text-white">
              Eternal<span className="text-gold-400">Vows</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed">
              Wujudkan pernikahan impian Anda bersama kami. Elegant, memorable, and perfect.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wider uppercase text-sm">Menu</h3>
            <ul className="space-y-2">
              <li><Link href="/#packages" className="hover:text-gold-400 transition-colors text-sm">Packages</Link></li>
              <li><Link href="/#about" className="hover:text-gold-400 transition-colors text-sm">About Us</Link></li>
              <li><Link href="/login" className="hover:text-gold-400 transition-colors text-sm">Login</Link></li>
              <li><Link href="/register" className="hover:text-gold-400 transition-colors text-sm">Register</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wider uppercase text-sm">Layanan</h3>
            <ul className="space-y-2">
              <li><span className="text-sm">Wedding Planning</span></li>
              <li><span className="text-sm">Decoration</span></li>
              <li><span className="text-sm">Catering</span></li>
              <li><span className="text-sm">Documentation</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wider uppercase text-sm">Kontak</h3>
            <ul className="space-y-2 text-sm">
              <li>Jl. Pernikahan Indah No. 123</li>
              <li>Jakarta Selatan, 12345</li>
              <li>hello@eternalvows.com</li>
              <li>+62 812 3456 7890</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} EternalVows. All rights reserved.</p>
          <p className="text-sm flex items-center gap-1">
            Made with <Heart size={14} className="text-red-500 fill-red-500" /> for your special day
          </p>
        </div>
      </div>
    </footer>
  );
}