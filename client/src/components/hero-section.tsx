import { useState } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation(`/?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="relative bg-black text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id="grid"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10 py-20 md:py-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Find Your Perfect
            <span className="relative ml-2">
              Study
              <span className="absolute -bottom-1 left-0 h-1 w-full bg-white"></span>
            </span>{" "}
            Program
          </h1>
          <p className="mt-6 text-lg text-gray-300 max-w-2xl">
            Discover top programs at leading universities across the UAE and make your education dreams come true.
          </p>
          
          <form onSubmit={handleSearch} className="mt-8 bg-white rounded-lg shadow-lg p-4">
            <div className="flex flex-col md:flex-row">
              <div className="flex-grow mb-3 md:mb-0 md:mr-3">
                <input
                  type="text"
                  placeholder="Search programs, universities..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="bg-[#F7941D] text-black px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition"
              >
                Search
              </button>
            </div>
          </form>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Link href="/programs" className="inline-flex items-center text-white hover:text-gray-300 transition">
              Browse All Programs
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-white/5 rounded-tl-full"></div>
      <div className="absolute top-20 right-10 w-20 h-20 bg-white/5 rounded-full"></div>
      <div className="absolute bottom-20 left-10 w-16 h-16 bg-white/5 rounded-full"></div>
    </div>
  );
}
