import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative bg-black py-16 lg:py-24 overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 z-0 grid grid-cols-12 grid-rows-12 gap-0 opacity-20 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={`row-${i}`} className="row-span-1 col-span-12 flex">
            {Array.from({ length: 12 }).map((_, j) => (
              <div key={`col-${j}`} className="flex-1 border border-gray-700"></div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Circular gradient blurs */}
      <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl py-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Guide: The #1 Platform for Admission in UAE
          </h1>
          <div className="h-1 w-24 bg-white mb-6"></div>
          <p className="text-lg text-white/90 mb-8">
            Guide helps education agents connect international students with premier UAE 
            universities. Maximize your commissions while providing students with life-
            changing opportunities through our expert platform.
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-8">
            <Link
              to="/signup"
              className="py-3 px-6 bg-white text-black font-medium rounded"
            >
              Become an Agent
            </Link>
            <Link
              to="/programs"
              className="py-3 px-6 bg-transparent text-white border border-white/30 font-medium rounded"
            >
              Explore Programs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}