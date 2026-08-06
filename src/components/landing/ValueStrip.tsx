import { values } from "@/components/landing/data";

export function ValueStrip() {
  return (
    <section className="studio-value-strip" aria-label="Nilai utama layanan">
      {values.map(({ icon: Icon, title, description }) => (
        <article className="studio-value-item" key={title}>
          <Icon size={31} strokeWidth={1.25} aria-hidden="true" />
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
