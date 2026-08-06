import { Quote } from "lucide-react";

import { testimonials } from "@/components/landing/data";

export function PromiseSection() {
  return (
    <section className="studio-promise" id="janji">
      <header>
        <p className="studio-eyebrow">Janji kami</p>
        <h2>Bukan hanya acara yang terlihat indah, tetapi proses yang terasa aman.</h2>
      </header>

      <div className="studio-testimonials">
        {testimonials.map((testimonial) => (
          <blockquote key={testimonial.couple}>
            <Quote size={24} strokeWidth={1.2} aria-hidden="true" />
            <p>{testimonial.quote}</p>
            <cite>— {testimonial.couple}</cite>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
