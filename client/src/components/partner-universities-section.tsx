import React, { useState, useEffect } from "react";
import { Link } from "wouter";

// Import university logos
import amityUniLogo from "../assets/university-logos/amity_university.jpg";
import westfordUniLogo from "../assets/university-logos/westford_university.jpg";
import manipalUniLogo from "../assets/university-logos/manipal_university.jpeg";
import deMontfortUniLogo from "../assets/university-logos/de_montfort_university.png";
import curtinUniLogo from "../assets/university-logos/curtin_university.png";
import symbiosisUniLogo from "../assets/university-logos/symbiosis_university.png";
import boltonRakUniLogo from "../assets/university-logos/university_of_bolton_rak_new.jpg";
import middlesexDubaiLogo from "../assets/university-logos/middlesex_dubai_dubai.png";

// Define the partner universities with their logos
const partnerUniversities = [
  { name: "Amity University", logo: amityUniLogo },
  { name: "Westford University", logo: westfordUniLogo },
  { name: "Manipal University", logo: manipalUniLogo },
  { name: "De Montfort University", logo: deMontfortUniLogo },
  { name: "Curtin University", logo: curtinUniLogo },
  { name: "Symbiosis University", logo: symbiosisUniLogo },
  { name: "University of Bolton Rak", logo: boltonRakUniLogo },
  { name: "Middlesex University Dubai", logo: middlesexDubaiLogo },
];

export default function PartnerUniversitiesSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    const section = document.getElementById("partner-universities-section");
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  return (
    <section
      id="partner-universities-section"
      className="py-20 bg-gray-50 relative overflow-hidden"
    >
      {/* Brand-inspired decorative elements - adjusted for mobile/tablet */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full hidden md:block"></div>
      <div className="absolute -bottom-16 -left-16 w-32 h-32 border border-primary/10 rounded-full hidden md:block"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
          <div className="max-w-xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
              Trusted Partnerships
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Top Partner Universities in{" "}
              <span className="text-primary">UAE</span>
            </h2>
            <p className="text-gray-600 font-light">
              We've built exclusive relationships with the UAE's leading
              educational institutions to offer students unparalleled
              opportunities
            </p>
          </div>

          <div className="mt-6 md:mt-0">
            <span className="text-primary font-medium">20+ Universities</span>
            <div className="flex items-center mt-2">
              <div className="h-1 w-16 bg-primary/20 rounded-full mr-2"></div>
              <div className="h-1 w-8 bg-primary rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="relative">
          {/* Stylized edge for premium look */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-8 bg-primary/10 rounded-b-full"></div>

          <div className="bg-white rounded-xl p-8 shadow-xl shadow-black/5 relative">
            {/* Subtle half-circle brand element - hidden on mobile/smaller screens */}
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-tr-full bg-primary/5 pointer-events-none hidden sm:block"></div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {partnerUniversities.map((university, index) => (
                <Link
                  to={`/programs?university=${encodeURIComponent(university.name)}`}
                  key={index}
                  className={`group relative transition-all duration-500 ease-out transform block ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="relative bg-white rounded-lg flex items-center justify-center p-6 h-28 border border-gray-100 group-hover:border-primary/20 transition-all duration-300 overflow-hidden group-hover:shadow-lg cursor-pointer">
                    {/* Hover effect with brand-inspired half-circle */}
                    <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-primary/5 rounded-tl-full scale-0 group-hover:scale-100 transition-transform duration-300 origin-top-left"></div>

                    <img
                      src={university.logo}
                      alt={university.name}
                      className="max-h-full max-w-full object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <h3 className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors duration-300">
                      {university.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>

            {/* Accent dots for design */}
            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary rounded-full"></div>
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary rounded-full"></div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 font-light">
            Our network is growing every month with{" "}
            <span className="text-primary font-medium">913+</span> programs
            currently available
          </p>
        </div>
      </div>
    </section>
  );
}