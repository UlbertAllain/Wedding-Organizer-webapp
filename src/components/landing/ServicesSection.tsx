import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { services } from "@/components/landing/data";

export function ServicesSection() {
  return (
    <section className="studio-services" id="layanan">
      <div className="studio-services-intro">
        <p className="studio-eyebrow">Layanan kami</p>
        <h2>Solusi lengkap untuk pernikahan impian kalian.</h2>
        <div className="studio-floral-line" aria-hidden="true" />
      </div>

      <div className="studio-service-list">
        {services.map((service) => (
          <article className="studio-service-row" key={service.number}>
            <span>{service.number}</span>
            <div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
            <Link href="/register" aria-label={`Konsultasi ${service.title}`}>
              <ChevronRight size={18} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
