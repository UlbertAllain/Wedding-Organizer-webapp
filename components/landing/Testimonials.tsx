import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Anisa & Rizky",
    text: "EternalVows turned our dream wedding into reality. The attention to detail was impeccable, and we didn't have to worry about a single thing. Truly the best decision we made!",
    rating: 5,
  },
  {
    name: "Sarah & Bimo",
    text: "From the initial consultation to the big day, the team was professional, responsive, and so creative. Our guests are still talking about how beautiful everything was.",
    rating: 5,
  },
  {
    name: "Dian & Kevin",
    text: "We opted for the Platinum package, and it was worth every penny. The vendors they work with are top-tier, and the coordination was seamless. Highly recommended!",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 md:py-32 bg-dark-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-gold-400 tracking-[0.3em] uppercase text-xs font-semibold mb-4">Testimonials</p>
          <h2 className="font-serif text-4xl md:text-5xl text-white">Words from Our Couples</h2>
          <div className="gold-divider mt-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-dark-800 p-8 border border-dark-700 hover:border-gold-400/30 transition-all duration-300 group">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={14} className="text-gold-400 fill-gold-400" />
                ))}
              </div>
              <p className="text-gray-400 italic leading-relaxed mb-6 text-sm">"{testimonial.text}"</p>
              <div className="w-8 h-px bg-gold-400 mb-4"></div>
              <h4 className="font-serif text-lg text-white">{testimonial.name}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}