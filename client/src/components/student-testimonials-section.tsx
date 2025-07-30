import React, { useState, useEffect } from "react";
import { Quote, Star } from "lucide-react";

export default function StudentTestimonialsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

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

    const section = document.getElementById("student-testimonials-section");
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  const testimonials = [
    {
      quote:
        "NextWave made my dream of studying at the American University of Dubai come true. Their guidance through the application process was invaluable, and they helped me find the perfect accommodation too.",
      author: "Priya Sharma",
      role: "Business Administration Student",
      university: "American University of Dubai",
      rating: 5,
      image: "PS",
    },
    {
      quote:
        "From visa assistance to finding my student community, NextWave supported me at every step. Now I'm pursuing my Master's in Engineering and loving life in Dubai!",
      author: "Ahmed Hassan",
      role: "Engineering Student",
      university: "Heriot-Watt University Dubai",
      rating: 5,
      image: "AH",
    },
    {
      quote:
        "The team understood exactly what I was looking for in a university program. Their knowledge of UAE universities is unmatched, and they found me the perfect fit.",
      author: "Maria Gonzalez",
      role: "International Business Student",
      university: "University of Wollongong Dubai",
      rating: 5,
      image: "MG",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section
      id="student-testimonials-section"
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
          <div className="nextwave-badge-with-dot mb-6">Student Stories</div>
          <h2 className="text-5xl md:text-[64px] font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            Real <span className="text-primary">Student</span> Experiences
          </h2>
          <p className="text-lg md:text-[25px] font-light text-gray-600 leading-relaxed max-w-3xl mx-auto mt-6">
            Hear from students who are now thriving in UAE universities
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div
            className={`transition-all duration-1000 ease-out transform ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
              {/* Quote background pattern */}
              <div className="absolute top-6 left-6 w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center">
                <Quote className="w-8 h-8 text-primary opacity-30" />
              </div>

              <div className="relative z-10 text-center">
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="w-6 h-6 text-yellow-400 fill-current"
                      />
                    ),
                  )}
                </div>

                <blockquote className="text-xl md:text-2xl font-light text-gray-700 leading-relaxed mb-8 italic">
                  "{testimonials[currentTestimonial].quote}"
                </blockquote>

                <div className="flex items-center justify-center space-x-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonials[currentTestimonial].image}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900 text-lg">
                      {testimonials[currentTestimonial].author}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {testimonials[currentTestimonial].role}
                    </div>
                    <div className="text-primary text-sm font-medium">
                      {testimonials[currentTestimonial].university}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? "bg-primary scale-125"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              900+
            </div>
            <div className="text-gray-600"> Programs </div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              20+
            </div>
            <div className="text-gray-600">Partner Universities</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              98%
            </div>
            <div className="text-gray-600">Success Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
}
