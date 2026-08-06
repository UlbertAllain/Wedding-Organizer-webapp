import { ArrowRight } from "lucide-react";

export function StorySection() {
  return (
    <section className="studio-story" id="portfolio">
      <figure className="studio-story-main">
        <div className="studio-photo studio-photo-ceremony" role="img" aria-label="Aisle pernikahan dengan rangkaian bunga" />
      </figure>

      <div className="studio-story-copy">
        <p className="studio-eyebrow">Cerita nyata</p>
        <h2>Suasana yang indah dimulai dari cerita yang dipahami.</h2>
        <p>
          Setiap pasangan memiliki kisah unik. Kami hadir untuk mendengarkan,
          memahami, lalu menerjemahkan cerita itu menjadi pernikahan yang autentik dan
          berkesan.
        </p>
        <a className="studio-text-link" href="#janji">
          Lihat cerita lainnya
          <ArrowRight size={15} aria-hidden="true" />
        </a>
      </div>

      <div className="studio-story-details">
        <figure>
          <div className="studio-photo studio-photo-reception" role="img" aria-label="Meja resepsi dengan lilin dan dekorasi bunga" />
        </figure>
        <figure>
          <div className="studio-photo studio-photo-bouquet" role="img" aria-label="Buket pengantin dan sepatu pernikahan" />
        </figure>
      </div>
    </section>
  );
}
