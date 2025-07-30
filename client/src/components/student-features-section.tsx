import React, { useState, useEffect } from "react";
import {
  MapPin,
  Home,
  Users,
  GraduationCap,
  Briefcase,
  Heart,
} from "lucide-react";

export default function StudentFeaturesSection() {
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

    const section = document.getElementById("student-features-section");
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  const features = [
    {
      icon: MapPin,
      title: "UAE-Focused Guidance",
      description:
        "Expert advice on universities, visa requirements, and living in the UAE from local specialists.",
    },
    {
      icon: Home,
      title: "Accommodation Support",
      description:
        "Find safe, affordable housing near your university with our trusted accommodation partners.",
    },
    {
      icon: Users,
      title: "Student Community",
      description:
        "Connect with fellow international students and build lasting friendships in the UAE.",
    },
    {
      icon: GraduationCap,
      title: "Academic Excellence",
      description:
        "Access to world-class programs at top UAE universities with international recognition.",
    },
    {
      icon: Briefcase,
      title: "Internship Opportunities",
      description:
        "Connect with top companies in Dubai and Abu Dhabi for valuable work experience.",
    },
    {
      icon: Heart,
      title: "Personal Support",
      description:
        "Dedicated counselors to guide you through every step of your UAE study journey.",
    },
  ];

  // Create G pattern background element
  const GPatternElement = () => (
    <div className="absolute -right-8 bottom-0 w-32 h-32 opacity-10 pointer-events-none transform rotate-180">
      <div className="w-full h-full border-[6px] border-primary rounded-tl-full"></div>
    </div>
  );

  return (
    <section
      id="student-features-section"
      className="py-12 sm:py-16 lg:py-24 bg-white relative overflow-hidden"
    >
      {/* Brand-inspired background elements - adjusted for mobile/tablet */}
      <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
      <div className="absolute -left-16 top-1/4 w-32 h-32 bg-primary/5 rounded-full opacity-40 pointer-events-none hidden md:block"></div>
      <div className="absolute right-0 bottom-0 w-64 h-64 rounded-tl-full bg-primary/5 opacity-20 pointer-events-none hidden md:block"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto mb-8 sm:mb-12 lg:mb-16 text-center">
          <div className="nextwave-badge-with-dot mb-4 sm:mb-6">Why Choose UAE</div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[64px] font-bold text-gray-900 mb-4 sm:mb-6 leading-tight tracking-tight">
            Everything You Need to <span className="text-primary">Succeed</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-[25px] font-light text-gray-600 leading-relaxed max-w-3xl mx-auto mt-4 sm:mt-6">
            From university selection to settling in, we provide comprehensive
            support for your UAE study experience
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative transition-all duration-700 ease-out transform ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:border-primary/20 hover:-translate-y-2 relative overflow-hidden">
                {/* Background pattern for each card */}
                <GPatternElement />

                <div className="relative z-10">
                  <div className="w-12 sm:w-16 h-12 sm:h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                    <feature.icon className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-secondary/20 rounded-full text-secondary font-bold mb-6">
            <span className="w-2 h-2 bg-secondary rounded-full mr-2"></span>
            Ready to Start?
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Let's Find Your Perfect University
          </h3>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a
              href="#consultation-form"
              className="btn-primary"
            >
              Book Free Consultation
            </a>
            <a
              href="/programs"
              className="btn-secondary"
            >
              Browse Programs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}