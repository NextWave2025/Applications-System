import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const testimonials = [
  {
    name: "Ayesha Rahman",
    country: "Pakistan",
    flag: "🇵🇰",
    university: "Heriot-Watt University Dubai",
    program: "Business Administration",
    quote: "NextWave made my dream of studying in Dubai a reality. The support was incredible from start to finish!",
    image: "/api/placeholder/80/80",
    rating: 5
  },
  {
    name: "Mohammed Al-Rashid",
    country: "Egypt",
    flag: "🇪🇬",
    university: "American University of Sharjah",
    program: "Computer Science",
    quote: "The guidance I received was exceptional. They helped me navigate every step of the application process.",
    image: "/api/placeholder/80/80",
    rating: 5
  },
  {
    name: "Priya Sharma",
    country: "India",
    flag: "🇮🇳",
    university: "Zayed University",
    program: "International Relations",
    quote: "From application to visa - NextWave handled everything professionally. Now I'm living my UAE dream!",
    image: "/api/placeholder/80/80",
    rating: 5
  }
];

export default function StudentTestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  return (
    <section className="py-16 lg:py-24 bg-primary-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Student <span className="text-primary">Success Stories</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Real students sharing their NextWave journey to UAE universities
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full translate-y-12 -translate-x-12"></div>

            {/* Navigation Buttons */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 z-10"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 z-10"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>

            {/* Testimonial Content */}
            <div className="text-center relative z-10">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                  {testimonials[currentIndex].flag}
                </div>
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>

              <blockquote className="text-xl lg:text-2xl font-medium text-gray-900 mb-6 leading-relaxed">
                "{testimonials[currentIndex].quote}"
              </blockquote>

              <div className="border-t border-gray-100 pt-6">
                <div className="font-bold text-lg text-gray-900">
                  {testimonials[currentIndex].name}
                </div>
                <div className="text-gray-600 mb-2">
                  {testimonials[currentIndex].country}
                </div>
                <div className="text-sm text-primary font-medium">
                  {testimonials[currentIndex].program} at {testimonials[currentIndex].university}
                </div>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index === currentIndex ? 'bg-primary' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}