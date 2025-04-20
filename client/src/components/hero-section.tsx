import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-primary to-primary-dark py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Find Your Perfect Study Program in the UAE
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Explore hundreds of universities and programs to find your perfect match. Apply with ease and start your educational journey today.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/programs"
              className="btn-primary-white text-center"
            >
              Explore Programs
            </Link>
            <Link
              to="/contact"
              className="btn-outline-white text-center"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-white/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full filter blur-3xl"></div>
      </div>
    </section>
  );
}