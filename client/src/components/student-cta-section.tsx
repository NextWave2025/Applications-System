import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, Calendar, Upload, Phone } from "lucide-react";

export default function StudentCTASection() {
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

    const section = document.getElementById("student-cta-section");
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  return (
    <section
      id="student-cta-section"
      className="py-24 bg-primary-800 text-white relative overflow-hidden"
    >
      {/* Brand-inspired decorative elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-secondary/10 to-transparent pointer-events-none"></div>
      <div className="absolute -left-16 top-0 w-32 h-32 bg-secondary/30 rounded-bl-full opacity-40 pointer-events-none"></div>
      <div className="absolute right-1/4 bottom-0 w-64 h-64 border border-secondary/30 rounded-full -mb-32 pointer-events-none"></div>

      {/* Half-circle brand element */}
      <div className="absolute left-0 bottom-0 w-80 h-80 -mb-40 -ml-40">
        <div className="w-full h-full border-[10px] border-secondary/30 rounded-full half-circle-left"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          className={`max-w-4xl mx-auto text-center transition-all duration-1000 ease-out transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="inline-flex items-center px-6 py-3 bg-secondary/20 rounded-full text-secondary font-bold mb-6">
            <span className="w-2 h-2 bg-secondary rounded-full mr-2"></span>
            Ready to Start Your Journey?
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Your UAE University
            <span className="text-secondary"> Adventure</span> Starts Here
          </h2>
          
          <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto font-light">
            Join thousands of international students who chose the UAE for their 
            higher education. Get personalized guidance and support every step of the way.
          </p>

          {/* Main CTAs */}
          <div className="flex flex-col lg:flex-row justify-center space-y-6 lg:space-y-0 lg:space-x-8 mb-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 flex-1 max-w-sm mx-auto lg:mx-0">
              <Calendar className="w-12 h-12 text-secondary mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-3">Free Consultation</h3>
              <p className="text-white/70 mb-6 text-sm">
                Get expert advice on universities, programs, and visa requirements
              </p>
              <a
                href="#consultation-form"
                className="w-full btn-primary block text-center"
              >
                Book Now
                <ArrowRight className="ml-2 h-4 w-4 inline" />
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 flex-1 max-w-sm mx-auto lg:mx-0">
              <Upload className="w-12 h-12 text-secondary mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-3">Submit Documents</h3>
              <p className="text-white/70 mb-6 text-sm">
                Already spoke with us? Upload your documents to get started
              </p>
              <a
                href="#document-upload"
                className="w-full btn-outline-white block text-center"
              >
                Upload Now
                <ArrowRight className="ml-2 h-4 w-4 inline" />
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 flex-1 max-w-sm mx-auto lg:mx-0">
              <Phone className="w-12 h-12 text-secondary mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-3">WhatsApp Support</h3>
              <p className="text-white/70 mb-6 text-sm">
                Get instant answers to your questions via WhatsApp
              </p>
              <a
                href="https://wa.me/971501234567"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-secondary block text-center"
              >
                Chat Now
                <ArrowRight className="ml-2 h-4 w-4 inline" />
              </a>
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <p className="text-white/80 mb-4">
              Want to explore programs first?
            </p>
            <Link
              href="/programs"
              className="inline-flex items-center text-secondary hover:text-yellow-300 transition-colors font-semibold"
            >
              Browse All UAE Programs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}