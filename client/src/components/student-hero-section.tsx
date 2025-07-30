import { Link } from "wouter";
import { useState, useEffect } from "react";
import { ChevronRight, Calendar, Upload } from "lucide-react";

export default function StudentHeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);
  }, []);

  return (
    <section className="relative bg-primary-800 py-20 lg:py-28 overflow-hidden">
      {/* Brand-inspired half-circle shape - hidden on mobile/tablet */}
      <div className="absolute -left-1/4 top-1/2 -translate-y-1/2 w-1/2 aspect-square bg-secondary/20 rounded-full filter blur-3xl opacity-30 pointer-events-none hidden lg:block"></div>

      {/* Brand-inspired decorative elements - adjusted for mobile/tablet */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-secondary/10 to-transparent"></div>
        {/* Large circles hidden on mobile/tablet */}
        <div className="absolute bottom-0 left-20 transform translate-y-1/3 w-96 h-96 border border-secondary/20 rounded-full hidden lg:block"></div>
        <div className="absolute right-40 top-0 transform -translate-y-1/2 w-64 h-64 border border-secondary/30 rounded-full hidden lg:block"></div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-32 h-32 bg-secondary rounded-l-full opacity-20 hidden lg:block"></div>
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

      {/* Circular gradient blurs - hidden on mobile/tablet */}
      <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden pointer-events-none hidden lg:block">
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center lg:items-start">
          <div
            className={`max-w-2xl py-8 sm:py-12 lg:py-24 transition-all duration-1000 ease-out transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-secondary/20 rounded-full text-secondary font-bold mb-4 sm:mb-6 text-xs sm:text-sm">
              <span className="w-2 h-2 bg-secondary rounded-full mr-2"></span>
              Your Gateway to UAE Universities
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Study in the
              <span className="text-secondary"> UAE</span> with
              <span className="relative ml-1.5">
                Confidence
                <svg
                  className="absolute bottom-2 left-0 w-full"
                  height="6"
                  viewBox="0 0 200 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 3C50 3 50 3 100 3C150 3 150 3 200 3"
                    stroke="#EFC61C"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="text-base sm:text-lg text-white/80 mb-6 sm:mb-8 font-light max-w-xl">
              Discover world-class universities in the UAE. Get expert guidance, 
              personalized support, and everything you need to start your 
              international education journey.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8">
              <Link
                href="#consultation-form"
                className="py-4 sm:py-3.5 px-6 sm:px-7 bg-secondary text-black font-bold rounded-lg hover:bg-yellow-400 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-secondary/30 flex items-center justify-center text-sm sm:text-base min-h-[44px]"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book Free Consultation
              </Link>
              <Link
                href="/programs"
                className="py-4 sm:py-3.5 px-6 sm:px-7 bg-[#41326B] text-white border border-[#41326B] font-semibold rounded-lg hover:bg-[#352858] transition-all duration-300 flex items-center justify-center text-sm sm:text-base min-h-[44px]"
              >
                Explore UAE Programs
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </div>



            <div className="mt-16 flex items-center">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium border-2 border-black">
                  AS
                </div>
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-medium border-2 border-black">
                  MR
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-medium border-2 border-black">
                  LK
                </div>
              </div>
              <div className="ml-4">
                <p className="text-white text-sm font-medium">
                  Join 2,000+ students studying in UAE
                </p>
                <div className="flex mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Image placeholder - can be replaced with actual student images */}
          <div className="lg:ml-16 flex-1 max-w-lg lg:max-w-none">
            <div
              className={`transition-all duration-1000 ease-out delay-300 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              <div className="relative">
                <div className="w-full h-96 lg:h-[500px] bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center">
                  <div className="text-center text-white/60">
                    <div className="w-16 h-16 mx-auto mb-4 bg-secondary/20 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <p className="text-sm">Student Success Visual</p>
                  </div>
                </div>
                
                {/* Floating stats cards */}
                <div className="absolute -left-4 top-20 bg-white rounded-lg p-3 shadow-lg">
                  <div className="text-xs text-gray-500 mb-1">Success Rate</div>
                  <div className="text-lg font-bold text-primary">98%</div>
                </div>
                
                <div className="absolute -right-4 bottom-20 bg-white rounded-lg p-3 shadow-lg">
                  <div className="text-xs text-gray-500 mb-1">UAE Universities</div>
                  <div className="text-lg font-bold text-primary">31+</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}