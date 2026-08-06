import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

import { formatCurrency } from "@/lib/format";
import type { PackageRecord } from "@/types/domain";

interface PackageSectionProps {
  packages: PackageRecord[];
  isLoading: boolean;
}

function packageGridClass(count: number) {
  if (count === 1) return "studio-package-grid is-single";
  if (count === 2) return "studio-package-grid is-double";
  return "studio-package-grid is-multiple";
}

export function PackageSection({ packages, isLoading }: PackageSectionProps) {
  const tiers = [...packages].sort((first, second) => first.price - second.price);
  const featuredId = tiers.find((tier) => tier.isFeatured)?.id ?? null;

  return (
    <section className="studio-packages" id="paket">
      <header className="studio-section-heading studio-package-heading">
        <div>
          <p className="studio-eyebrow">Paket pernikahan</p>
          <h2>Pilihan layanan yang fleksibel untuk berbagai kebutuhan.</h2>
        </div>
        <p>
          Paket yang tampil di bawah ini berasal langsung dari katalog aktif di
          Firestore. Setiap cakupan tetap dapat disesuaikan setelah konsultasi.
        </p>
      </header>

      {isLoading ? (
        <div className="studio-package-state" role="status" aria-live="polite">
          <span className="studio-package-loader" aria-hidden="true" />
          <div>
            <strong>Memuat paket pernikahan</strong>
            <p>Menyiapkan katalog aktif untuk kalian.</p>
          </div>
        </div>
      ) : tiers.length ? (
        <div className={packageGridClass(tiers.length)}>
          {tiers.map((tier, index) => {
            const featured = tier.id === featuredId;

            return (
              <article
                className={featured ? "studio-package-card is-featured" : "studio-package-card"}
                key={tier.id}
              >
                {featured ? (
                  <div className="studio-package-ribbon">
                    <Sparkles size={13} aria-hidden="true" />
                    Rekomendasi
                  </div>
                ) : null}

                <p className="studio-package-kicker">
                  Paket {String(index + 1).padStart(2, "0")}
                </p>
                <h3>{tier.name}</h3>
                <p className="studio-package-description">{tier.description}</p>

                <div className="studio-package-price">
                  <span>Mulai dari</span>
                  <strong>{formatCurrency(tier.price)}</strong>
                </div>

                <ul>
                  {tier.features.map((feature, featureIndex) => (
                    <li key={`${tier.id}-${featureIndex}`}>
                      <Check size={15} strokeWidth={1.8} aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  className={featured ? "studio-button studio-button-primary" : "studio-button studio-button-outline"}
                  href={`/register?package=${encodeURIComponent(tier.id)}`}
                >
                  Konsultasikan paket
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="studio-package-state is-empty">
          <div>
            <strong>Belum ada paket yang dipublikasikan.</strong>
            <p>
              Admin dapat mengaktifkan paket dari dashboard. Konsultasi tetap dapat
              dimulai sambil menentukan layanan yang paling sesuai.
            </p>
          </div>
          <Link className="studio-button studio-button-primary" href="/register">
            Mulai konsultasi
          </Link>
        </div>
      )}

      {tiers.length ? (
        <p className="studio-package-note">
          *Harga dapat berubah mengikuti skala acara, lokasi, dan kebutuhan vendor.
        </p>
      ) : null}
    </section>
  );
}
