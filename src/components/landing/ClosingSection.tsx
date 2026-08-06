import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function ClosingSection() {
  return (
    <section className="studio-closing">
      <div className="studio-closing-photo" role="img" aria-label="Pasangan pengantin berjalan di area resepsi" />
      <div className="studio-closing-overlay" />
      <div className="studio-closing-copy">
        <p className="studio-eyebrow studio-eyebrow-light">Siap memulai?</p>
        <h2>Wujudkan pernikahan impian kalian bersama kami.</h2>
        <p>
          Bagikan cerita kalian dan dapatkan konsultasi awal untuk menyusun langkah
          pertama menuju hari yang paling berarti.
        </p>
        <Link className="studio-button studio-button-primary studio-button-on-dark" href="/register">
          Konsultasi sekarang
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
