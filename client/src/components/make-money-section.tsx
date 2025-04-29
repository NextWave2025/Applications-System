import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { CheckCircle, UserPlus, Users, CreditCard } from "lucide-react";

export default function SimpleProcessSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('simple-process-section');
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  const steps = [
    {
      number: 1,
      title: "Sign up",
      description: "Apply to become an approved Guide agent",
      icon: <UserPlus className="h-6 w-6" />,
    },
    {
      number: 2,
      title: "Refer students",
      description: "We provide brochures and support. You refer students who want to study abroad",
      icon: <Users className="h-6 w-6" />,
    },
    {
      number: 3,
      title: "Earn Money",
      description: "Once a student enrolls, you earn 100% commission. We handle the rest",
      icon: <CreditCard className="h-6 w-6" />,
    },
  ];

  return (
    <section id="simple-process-section" className="py-20 bg-white relative overflow-hidden">
      {/* Brand-inspired decorative elements - adjusted for mobile/tablet */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-gray-50 to-white"></div>
      <div className="absolute -bottom-16 -right-16 w-32 h-32 border border-primary/10 rounded-full hidden md:block"></div>
      <div className="absolute top-1/4 -left-16 w-32 h-32 border-8 border-primary/5 rounded-full hidden md:block"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header with brand-inspired design */}
        <div className="max-w-3xl mx-auto mb-16 text-center">
          {/* Centered "For Education Agents" tag */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
              For Education Agents
            </div>
          </div>
          {/* Removed outline from heading */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            A Simple <span className="text-primary">Process</span>
          </h2>
          <p className="text-gray-600 font-light text-lg mt-6">
            Start earning money by referring students to universities in just three simple steps
          </p>
        </div>

        {/* Modern process visualization with brand elements */}
        <div className="max-w-6xl mx-auto">
          <div className="relative mb-20">
            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`relative transition-all duration-700 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  {/* Step Number - Circle with half-circle accent */}
                  <div className="relative mx-auto md:mx-0 mb-8">
                    <div className="relative z-10 bg-white w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center font-bold text-2xl text-primary shadow-lg shadow-primary/10">
                      {step.number}
                    </div>

                    {/* Half-circle design element inspired by logo */}
                    <div className="absolute top-0 -right-2 w-8 h-8 bg-primary/10 rounded-bl-full"></div>

                    {/* Completion check that appears with animation */}
                    <div
                      className={`absolute -right-2 -bottom-2 bg-white rounded-full transition-all duration-500 transform ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
                      style={{ transitionDelay: `${800 + index * 200}ms` }}
                    >
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="text-center md:text-left">
                    {/* Icon in orange branded circle */}
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                      {step.icon}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 font-light">{step.description}</p>

                    {/* Visual divider on mobile only */}
                    <div className="md:hidden w-16 h-1 bg-primary/20 mx-auto mt-6 rounded-full">
                      <div className="w-8 h-full bg-primary rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button with enhanced design */}
          <div className="text-center relative">
            {/* Decorative dots */}
            <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 w-4 h-4 bg-primary/20 rounded-full"></div>
            <div className="absolute top-1/4 right-1/3 transform -translate-y-1/2 w-2 h-2 bg-primary/30 rounded-full"></div>

            <Link
              href="/auth"
              className="inline-flex items-center justify-center bg-primary text-white px-10 py-4 rounded-md font-medium hover:bg-primary/90 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-primary/20"
            >
              Partner with Guide
              <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.16667 10H15.8333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.8333 5L15.8333 10L10.8333 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            {/* Trust indicator */}
            <div className="mt-6 flex items-center justify-center">
              <div className="flex items-center text-gray-500 text-sm">
                <svg className="h-4 w-4 text-primary mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Free signup, no monthly fees
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
