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
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
          <div
            className={`max-w-2xl py-8 sm:py-12 lg:py-24 transition-all duration-1000 ease-out transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-secondary/20 rounded-full text-secondary font-bold mb-4 sm:mb-6 text-xs sm:text-sm">
              <span className="w-2 h-2 bg-secondary rounded-full mr-2"></span>
              Your Gateway to UAE Universities
            </div>
            {/* Student testimonial badge */}
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 text-sm mb-6">
              <div className="w-6 h-6 bg-white/20 rounded-full mr-2 flex items-center justify-center">
                <span className="text-xs">🇵🇰</span>
              </div>
              "I got into Heriot-Watt with their help" - Ayesha, Pakistan
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight tracking-wide">
              Study in the UAE.
              <br />
              <span className="text-secondary">We'll Guide You There.</span>
            </h1>
            <p className="text-base sm:text-lg text-white/80 mb-6 sm:mb-8 font-light max-w-xl">
              Confused about where to start? Get expert help, explore top programs, and apply stress-free.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8">
              <a
                href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ2KkMjW8QjV4bP0XOlLqHgJ7vUHX0YzB8R8kN_t2K4LrZp2Q1MzX5Y7W9B3?gv=true"
                target="_blank"
                rel="noopener noreferrer"
                className="py-4 sm:py-3.5 px-6 sm:px-7 bg-secondary text-black font-bold rounded-lg hover:bg-yellow-400 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-secondary/30 flex items-center justify-center text-sm sm:text-base min-h-[44px]"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book Free Consultation
              </a>
              <Link
                href="/programs"
                className="py-4 sm:py-3.5 px-6 sm:px-7 bg-[#41326B] text-white border border-[#41326B] font-semibold rounded-lg hover:bg-[#352858] transition-all duration-300 flex items-center justify-center text-sm sm:text-base min-h-[44px]"
              >
                Explore UAE Programs
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Student Success Indicators - Mobile Optimized */}
            <div className="mt-12 lg:mt-16 flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex -space-x-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold border-4 border-white shadow-lg">
                  AS
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-sm font-bold border-4 border-white shadow-lg">
                  MR
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold border-4 border-white shadow-lg">
                  LK
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold border-4 border-white shadow-lg">
                  +
                </div>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-white text-base sm:text-lg font-medium">
                  2,000+ successful students
                </p>
                <div className="flex justify-center sm:justify-start mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-white/80 text-sm">4.9/5 rating</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Visual - Mobile optimized diverse students */}
          <div className="lg:ml-16 flex-1 max-w-lg lg:max-w-none">
            <div
              className={`transition-all duration-1000 ease-out delay-300 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              <div className="relative">
                {/* Main Hero Image Container */}
                <div className="relative w-full h-80 sm:h-96 lg:h-[500px] bg-gradient-to-br from-secondary/20 to-primary/20 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
                  {/* Floating Success Metrics - Mobile Optimized */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-lg animate-pulse">
                    <div className="text-[10px] sm:text-xs text-gray-600 font-medium">Success Rate</div>
                    <div className="text-lg sm:text-2xl font-bold text-primary">98%</div>
                  </div>
                  
                  <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-lg animate-pulse" style={{animationDelay: '1s'}}>
                    <div className="text-[10px] sm:text-xs text-gray-600 font-medium">UAE Universities</div>
                    <div className="text-lg sm:text-2xl font-bold text-primary">20+</div>
                  </div>

                  {/* Central Visual Element */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      {/* Modern Student Success Visual */}
                      <div className="w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 mx-auto mb-4 sm:mb-6 relative">
                        {/* Multi-layered Modern Design */}
                        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-yellow-300 rounded-full opacity-20 animate-pulse"></div>
                        <div className="absolute inset-2 bg-gradient-to-br from-primary to-purple-600 rounded-full opacity-30 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                        
                        {/* Central Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white rounded-full shadow-lg flex items-center justify-center">
                            <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 3L1 9V15C1 19.42 5.58 22 12 22C18.42 22 23 19.42 23 15V9L12 3ZM12 5.18L19.36 9L12 12.82L4.64 9L12 5.18ZM21 15C21 18.31 17.66 20 12 20C6.34 20 3 18.31 3 15V11.24L12 16L21 11.24V15Z"/>
                            </svg>
                          </div>
                        </div>
                        
                        {/* Floating Achievement Elements */}
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                          <span className="text-xs sm:text-sm">🏆</span>
                        </div>
                        <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
                        <div className="absolute top-1/2 -right-2 sm:-right-3 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full animate-ping"></div>
                        <div className="absolute top-1/4 -left-2 sm:-left-3 w-3 h-3 sm:w-4 sm:h-4 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
                      </div>
                      
                      <div className="px-3 sm:px-4">
                        <p className="text-white/90 font-medium text-xs sm:text-sm lg:text-base">
                          Join 2,000+ successful students
                        </p>
                        <div className="flex justify-center mt-1 sm:mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400"
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

                  {/* Responsive Background Pattern */}
                  <div className="absolute inset-0 opacity-5 sm:opacity-10">
                    <div className="absolute top-6 left-6 sm:top-10 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 border border-white sm:border-2 rounded-full"></div>
                    <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 w-10 h-10 sm:w-16 sm:h-16 border border-secondary sm:border-2 rounded-full"></div>
                    <div className="absolute top-1/2 left-2 sm:left-4 w-8 h-8 sm:w-12 sm:h-12 border border-white rounded-full"></div>
                    <div className="absolute top-1/4 right-2 sm:right-8 w-6 h-6 sm:w-10 sm:h-10 border border-secondary rounded-full"></div>
                  </div>
                </div>

                {/* Floating stats cards */}
                <div className="absolute -left-4 top-20 bg-white rounded-lg p-3 shadow-lg">
                  <div className="text-xs text-gray-500 mb-1">Success Rate</div>
                  <div className="text-lg font-bold text-primary">98%</div>
                </div>

                <div className="absolute -right-4 bottom-20 bg-white rounded-lg p-3 shadow-lg">
                  <div className="text-xs text-gray-500 mb-1">
                    UAE Universities
                  </div>
                  <div className="text-lg font-bold text-primary">20+</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
