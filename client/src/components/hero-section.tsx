import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);
  }, []);

  return (
    <section className="relative bg-black py-20 lg:py-28 overflow-hidden">
      {/* Brand-inspired half-circle shape */}
      <div className="absolute -left-1/4 top-1/2 -translate-y-1/2 w-1/2 aspect-square bg-primary/40 rounded-full filter blur-3xl opacity-30 pointer-events-none"></div>
      
      {/* Brand-inspired decorative elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-primary/5 to-transparent"></div>
        <div className="absolute bottom-0 left-20 transform translate-y-1/3 w-96 h-96 border border-primary/10 rounded-full"></div>
        <div className="absolute right-40 top-0 transform -translate-y-1/2 w-64 h-64 border border-primary/20 rounded-full"></div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-32 h-32 bg-primary rounded-l-full opacity-10"></div>
      </div>

      {/* Grid pattern - more subtle and modern */}
      <div className="absolute inset-0 z-0 grid grid-cols-12 grid-rows-12 gap-0 opacity-10 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={`row-${i}`} className="row-span-1 col-span-12 flex">
            {Array.from({ length: 12 }).map((_, j) => (
              <div
                key={`col-${j}`}
                className="flex-1 border border-gray-800"
              ></div>
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
        <div className="flex flex-col-reverse lg:flex-row items-center lg:items-start">
          <div className={`max-w-2xl py-12 lg:py-24 transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary font-medium mb-6 text-sm">
              <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
              The #1 Platform for Admission in UAE
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="text-primary">Guide</span> Your Students to
              <span className="relative"> 
                Success
                <svg className="absolute bottom-2 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 3C50 3 50 3 100 3C150 3 150 3 200 3" stroke="#EF3009" strokeWidth="5" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
            <p className="text-lg text-white/80 mb-8 font-light max-w-xl">
              Guide helps education agents connect international students with
              premier UAE universities. Maximize your commissions while providing
              students with life-changing opportunities.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-5 mt-8">
              <Link
                to="/auth"
                state={{ redirectTo: "/dashboard" }}
                className="py-3.5 px-7 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-primary/20 flex items-center justify-center"
              >
                Become an Agent
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/programs"
                className="py-3.5 px-7 bg-transparent text-white border border-white/20 font-medium rounded-md hover:bg-white/5 transition-all duration-300 flex items-center justify-center"
              >
                Explore Programs
              </Link>
            </div>
            
            <div className="mt-16 flex items-center">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium border-2 border-black">UA</div>
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-medium border-2 border-black">MS</div>
                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-medium border-2 border-black">JK</div>
              </div>
              <div className="ml-4">
                <p className="text-white text-sm font-medium">Trusted by <span className="text-primary">500+</span> agents worldwide</p>
                <div className="flex mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-white/60 text-xs">4.9/5</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`relative lg:w-1/2 flex justify-center items-center transition-all duration-1000 delay-300 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative w-full max-w-md aspect-square">
              {/* Decorative half-circle - inspired by logo */}
              <div className="absolute -left-6 bottom-1/4 w-72 h-72 border-[16px] border-primary rounded-full opacity-30 clip-half-circle-left"></div>
              
              {/* Main circular element */}
              <div className="absolute inset-0 bg-gradient-to-br from-black to-gray-900 rounded-full border border-gray-800 p-10 flex items-center justify-center overflow-hidden">
                <div className="relative z-10 text-center">
                  <div className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">31+</div>
                  <div className="text-primary font-medium">UAE Universities</div>
                  <div className="h-px w-24 bg-gray-700 mx-auto my-4"></div>
                  <div className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">913+</div>
                  <div className="text-primary font-medium">Programs</div>
                </div>
              </div>
              
              {/* Accent circles */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 backdrop-blur-md rounded-full"></div>
              <div className="absolute -bottom-2 right-1/4 w-12 h-12 bg-primary/10 backdrop-blur-md rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom CSS for half-circle clip - implemented as a style tag */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .clip-half-circle-left {
          clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);
        }
        `}} />
    </section>
  );
}
