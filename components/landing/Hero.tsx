import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop')" }}
      ></div>
      
      {/* Overlay Gradient Premium */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900/60 via-dark-900/40 to-dark-900/80"></div>

      {/* Konten */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-[-5rem]">
        <div className="animate-fade-in">
          <div className="gold-divider mb-8"></div>
          <p className="text-gold-400 tracking-[0.4em] uppercase text-xs md:text-sm mb-6 font-sans font-medium">
            A Lifetime of Happiness
          </p>
        </div>
        
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white leading-[1.1] mb-8 animate-fade-in-up">
          Begin Your<br/> 
          <span className="italic text-gold-300">Forever</span> Together
        </h1>

        <p className="text-gray-300 text-base md:text-lg max-w-xl mx-auto mb-12 font-light leading-relaxed animate-fade-in-up animate-delay-200">
          Crafting bespoke wedding experiences with an exquisite touch of elegance, ensuring your most precious day is nothing short of perfection.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-fade-in-up animate-delay-400">
          <Link
            href="/register"
            className="px-10 py-4 bg-gold-400 hover:bg-gold-500 text-dark-900 font-bold tracking-[0.2em] uppercase text-xs transition-all duration-300 w-full sm:w-auto"
          >
            Start Planning
          </Link>
          <Link
            href="/#about"
            className="px-10 py-4 border border-white/20 hover:border-gold-400 text-white hover:text-gold-400 tracking-[0.2em] uppercase text-xs transition-all duration-300 w-full sm:w-auto"
          >
            Discover More
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-5 h-9 border border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-0.5 h-2 bg-gold-400 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}