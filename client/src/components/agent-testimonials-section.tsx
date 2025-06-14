import React, { useState, useEffect } from "react";
import { Quote } from "lucide-react";

export default function AgentTestimonialsSection() {
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

    const section = document.getElementById("agent-testimonials-section");
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  const testimonials = [
    {
      quote:
        "Working with NextWave has transformed our agency. The platform is intuitive, and the commission structure is the best in the industry.",
      author: "Sarah Ahmed",
      role: "Education Consultant",
      location: "Dubai, UAE",
      avatar: "SA",
    },
    {
      quote:
        "The visa support tools have been a game-changer for our Indian students. The country-specific checklists and requirements save us so much time.",
      author: "Rajiv Mehta",
      role: "Recruitment Manager",
      location: "Mumbai, India",
      avatar: "RM",
    },
    {
      quote:
        "The marketing materials provided are professional and effective. Our conversion rates have improved significantly since partnering with NextWave.",
      author: "Elena Kim",
      role: "Agency Director",
      location: "Seoul, South Korea",
      avatar: "EK",
    },
  ];

  return (
    <section
      id="agent-testimonials-section"
      className="py-24 bg-white relative overflow-hidden"
    >
      {/* Brand-inspired background elements */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-gray-50/50 to-transparent pointer-events-none"></div>
      <div className="absolute -left-16 bottom-1/4 w-32 h-32 bg-primary/5 rounded-full opacity-40 pointer-events-none"></div>
      <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-bl-full opacity-20 pointer-events-none"></div>

      {/* G pattern background subtly in the background */}
      <div className="absolute bottom-0 right-0 w-80 h-80 opacity-5 pointer-events-none">
        <div className="w-full h-full border-[20px] border-primary rounded-tl-full"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <div className="guide-badge-with-dot mb-6">Success Stories</div>
          <h2 className="text-5xl md:text-[64px] font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            What Our <span className="text-primary">Agents</span> Say
          </h2>
          <p className="text-lg md:text-[25px] font-light text-gray-600 leading-relaxed max-w-3xl mx-auto mt-6">
            Hear from education agents who are successfully placing students in
            UAE universities
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-lg border border-gray-100 shadow-xl overflow-hidden transition-all duration-700 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Top Pattern with brand colors */}
              <div className="absolute top-0 left-0 w-full h-40 opacity-10 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent"></div>
                <div className="absolute -top-16 -left-16 w-32 h-32 border-8 border-primary/20 rounded-full"></div>
                <div className="absolute -right-8 top-0 w-24 h-24 bg-primary/10 rounded-bl-full"></div>
              </div>

              {/* Quote Icon with brand styling */}
              <div className="absolute top-2 right-2 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Quote className="w-5 h-5 text-primary" />
              </div>

              <div className="p-8 pt-12 relative z-10">
                {/* Quote Text */}
                <p className="text-[16px] font-light leading-relaxed text-gray-700 mb-8 min-h-[120px]">
                  "{testimonial.quote}"
                </p>

                {/* Author Info */}
                <div className="pt-6 border-t border-gray-100 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-xs font-medium">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-900 font-medium">
                      {testimonial.author}
                    </p>
                    <p className="text-xs text-gray-500 font-light">
                      {testimonial.role}, {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom accent line for brand identity */}
              <div className="absolute bottom-0 left-0 w-full h-1">
                <div className="h-full w-1/3 bg-primary"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicator with Brand Styling */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-primary/5 text-gray-600 text-sm font-light">
            <span className="mr-2 text-primary">★★★★★</span>
            Rated 5/5 by our partner agencies worldwide
          </div>
        </div>
      </div>
    </section>
  );
}
