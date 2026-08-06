import { processItems } from "@/components/landing/data";

export function ProcessSection() {
  return (
    <section className="studio-process" id="cara-kerja">
      <header className="studio-process-heading">
        <p className="studio-eyebrow studio-eyebrow-light">Proses kami</p>
        <h2>Proses yang terasa ringan karena arah kerjanya jelas.</h2>
        <span aria-hidden="true">Process</span>
      </header>

      <div className="studio-process-grid">
        {processItems.map(({ icon: Icon, number, title, description }) => (
          <article key={number}>
            <div className="studio-process-meta">
              <span>{number}</span>
              <Icon size={30} strokeWidth={1.25} aria-hidden="true" />
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
