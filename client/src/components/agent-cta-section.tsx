import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function AgentCTASection() {
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

    const section = document.getElementById("agent-cta-section");
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  return (
    <section
      id="agent-cta-section"
      className="py-24 bg-black text-white relative overflow-hidden"
    >
      {/* Brand-inspired decorative elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
      <div className="absolute -left-16 top-0 w-32 h-32 bg-primary/20 rounded-bl-full opacity-40 pointer-events-none"></div>
      <div className="absolute right-1/4 bottom-0 w-64 h-64 border border-primary/20 rounded-full -mb-32 pointer-events-none"></div>

      {/* Half-circle brand element */}
      <div className="absolute left-0 bottom-0 w-80 h-80 -mb-40 -ml-40">
        <div className="w-full h-full border-[10px] border-primary/20 rounded-full half-circle-left"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <div
              className={`transition-all duration-1000 ease-out transform ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"}`}
            >
              <div className="nextwave-badge-with-dot mb-6">
                Start Your Journey
              </div>
              <h2 className="heading-2 mb-6">
                Ready to <span className="text-primary">Grow</span> Your
                Education Agency?
              </h2>
              <div className="h-1 w-24 bg-primary mb-8 rounded-full"></div>
              <p className="subtitle text-white/80 mb-10 font-light">
                Join our network of successful agents and start placing students
                in top UAE universities today. With NextWave, you gain instant
                access to our platform, marketing materials, and expert support.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-10">
                <div>
                  <p className="text-4xl font-bold text-primary mb-1">20+</p>
                  <p className="text-white/70 text-sm font-light">
                    Partner Universities
                  </p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary mb-1">913+</p>
                  <p className="text-white/70 text-sm font-light">
                    Academic Programs
                  </p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary mb-1">100%</p>
                  <p className="text-white/70 text-sm font-light">
                    Commission Rate
                  </p>
                </div>
              </div>
            </div>

            {/* Right content - CTA Card */}
            <div
              className={`transition-all duration-1000 delay-300 ease-out transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-2xl relative">
                {/* Decorative half-circle element */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/10 rounded-full"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-tl-full"></div>

                <h3 className="text-2xl font-bold mb-6">
                  Join as an Agent Today
                </h3>
                <p className="text-white/70 mb-8 font-light">
                  Complete our agent registration form and get approved within
                  48 hours to start earning commissions.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link
                    href="/auth"
                    state={{ redirectTo: "/dashboard" }}
                    className="btn-primary py-4 px-6 flex items-center justify-center"
                  >
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link href="/contact" className="btn-outline-white">
                    Contact Sales
                  </Link>
                </div>

                {/* Trust elements */}
                <div className="flex items-center text-sm text-white/60 font-light">
                  <svg
                    className="h-5 w-5 text-primary mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 12L11 14L15 10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  No monthly fees or subscription charges
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
