import { useState } from "react";
import { useLocation } from "wouter";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation(`/?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <section className="bg-primary text-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Find Your Perfect Study Program
          </h1>
          <p className="text-xl mb-8">
            Discover top programs at leading universities across the UAE and make your education dreams come true.
          </p>
          <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-4">
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
                className="bg-[#F7941D] text-white px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
