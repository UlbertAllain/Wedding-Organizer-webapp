"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Gallery = {
  id: string;
  image: string;
  caption: string | null;
};

export default function Portfolio() {
  const [photos, setPhotos] = useState<Gallery[]>([]);

  useEffect(() => {
    // Fetch dari API gallery yang udah kita bikin, atau pake dummy dulu
    // Kalau database masih kosong, kita pake gambar dummy
    const dummyPhotos = [
      { id: "1", image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop", caption: "The First Look" },
      { id: "2", image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=600&auto=format&fit=crop", caption: "Sacred Vows" },
      { id: "3", image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=600&auto=format&fit=crop", caption: "Reception Night" },
      { id: "4", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop", caption: "Elegant Details" },
    ];
    setPhotos(dummyPhotos);
  }, []);

  return (
    <section id="portfolio" className="py-24 md:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-gold-500 tracking-[0.3em] uppercase text-xs font-semibold mb-4">Our Work</p>
          <h2 className="font-serif text-4xl md:text-5xl text-dark-900">Captured Moments</h2>
          <div className="gold-divider mt-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div 
              key={photo.id} 
              className={`relative group overflow-hidden cursor-pointer ${
                index === 0 || index === 3 ? "lg:row-span-2 h-80 lg:h-full" : "h-80"
              }`}
            >
              <img 
                src={photo.image} 
                alt={photo.caption || "Portfolio"} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Overlay Hover */}
              <div className="absolute inset-0 bg-dark-900/0 group-hover:bg-dark-900/60 transition-all duration-500 flex items-end p-6">
                <div className="translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="w-8 h-px bg-gold-400 mb-3"></div>
                  <h3 className="text-white font-serif text-xl">{photo.caption}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/admin/gallery" className="text-gold-500 hover:text-gold-600 tracking-[0.2em] uppercase text-xs font-semibold border-b border-gold-400 pb-1 transition-colors">
            View Full Gallery
          </Link>
        </div>
      </div>
    </section>
  );
}