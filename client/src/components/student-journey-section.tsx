import { Calendar, Search, FileText, Award, Plane } from "lucide-react";
import { useEffect, useState } from "react";

const journeySteps = [
  {
    icon: Calendar,
    title: "Book a Consultation",
    description: "Schedule your free consultation with our UAE education experts",
    step: "01"
  },
  {
    icon: Search,
    title: "Choose Your Program",
    description: "Explore and select from 20+ top UAE universities and programs",
    step: "02"
  },
  {
    icon: FileText,
    title: "Submit Application",
    description: "We'll help you prepare and submit your complete application",
    step: "03"
  },
  {
    icon: Award,
    title: "Receive Your Offer",
    description: "Get your university acceptance letter and celebrate!",
    step: "04"
  },
  {
    icon: Plane,
    title: "Prepare for UAE",
    description: "Visa support, accommodation help, and pre-departure guidance",
    step: "05"
  }
];

export default function StudentJourneySection() {
  const [visibleSteps, setVisibleSteps] = useState<boolean[]>(new Array(journeySteps.length).fill(false));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleSteps(prev => {
              const newState = [...prev];
              newState[index] = true;
              return newState;
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    const steps = document.querySelectorAll('.journey-step');
    steps.forEach((step) => observer.observe(step));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Your Journey to <span className="text-primary">UAE Universities</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            From first consultation to stepping foot in the UAE - we guide you through every step
          </p>
        </div>

        {/* Timeline - Mobile Vertical, Desktop Horizontal */}
        <div className="relative">
          {/* Mobile Timeline (Vertical) */}
          <div className="lg:hidden">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary/20"></div>
            {journeySteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  data-index={index}
                  className={`journey-step relative flex items-start mb-8 ${
                    visibleSteps[index]
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-4'
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className="absolute left-4 w-4 h-4 bg-primary rounded-full border-4 border-white shadow-lg"></div>
                  <div className="ml-12 bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-sm font-bold text-primary">STEP {step.step}</div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Timeline (Horizontal) */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Connection Line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/20 transform -translate-y-1/2"></div>
              
              <div className="grid grid-cols-5 gap-4">
                {journeySteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={index}
                      data-index={index}
                      className={`journey-step text-center transition-all duration-700 ${
                        visibleSteps[index]
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-8'
                      }`}
                      style={{ transitionDelay: `${index * 200}ms` }}
                    >
                      {/* Step Circle */}
                      <div className="relative mx-auto w-16 h-16 bg-white border-4 border-primary rounded-full flex items-center justify-center shadow-lg mb-4">
                        <Icon className="w-7 h-7 text-primary" />
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-xs font-bold text-black">
                          {step.step}
                        </div>
                      </div>
                      
                      {/* Step Content */}
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}