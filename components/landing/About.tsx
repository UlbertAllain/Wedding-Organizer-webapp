import Link from "next/link";

export default function About() {
  return (
    <section id="about" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Column */}
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-full h-full border border-gold-400/30 z-0"></div>
            <img 
              src="https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070&auto=format&fit=crop" 
              alt="Wedding Details" 
              className="relative z-10 w-full h-[500px] object-cover shadow-2xl"
            />
          </div>

          {/* Text Column */}
          <div>
            <p className="text-gold-500 tracking-[0.3em] uppercase text-xs font-semibold mb-4">Our Philosophy</p>
            <h2 className="font-serif text-4xl md:text-5xl text-dark-900 mb-6 leading-tight">
              Crafting Timeless <span className="italic text-gold-500">Memories</span>
            </h2>
            <div className="w-16 h-px bg-gold-400 mb-8"></div>
            
            <p className="text-gray-600 leading-relaxed mb-6">
              At EternalVows, we believe that every love story is unique and deserves to be celebrated in the most extraordinary way. We are not just planners; we are architects of joy, curating every detail to reflect your personal love journey.
            </p>
            <p className="text-gray-600 leading-relaxed mb-10">
              From intimate garden ceremonies to grand ballroom receptions, our team ensures a seamless and luxurious experience, allowing you to savor every magical moment of your special day.
            </p>

            <Link 
              href="/#packages" 
              className="inline-block px-8 py-3 bg-dark-900 text-gold-400 hover:bg-dark-800 tracking-[0.2em] uppercase text-xs font-semibold transition-all"
            >
              View Packages
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}