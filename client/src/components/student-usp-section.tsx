import { GraduationCap, Users, Navigation, Handshake, Briefcase, Home } from "lucide-react";
import { useEffect, useState } from "react";

const uspCards = [
  {
    icon: GraduationCap,
    title: "UAE-Focused Admission",
    description: "We specialize in helping students enter UAE universities.",
    bgColor: "bg-primary/10",
    iconColor: "text-primary"
  },
  {
    icon: Users,
    title: "Real Human Support",
    description: "One-on-one guidance from an admissions advisor.",
    bgColor: "bg-secondary/10",
    iconColor: "text-secondary"
  },
  {
    icon: Navigation,
    title: "Explore + Apply Easily",
    description: "Discover top programs and apply in a few steps.",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-600"
  },
  {
    icon: Handshake,
    title: "Student Community",
    description: "Meet others through events and shared workshops.",
    bgColor: "bg-green-500/10",
    iconColor: "text-green-600"
  },
  {
    icon: Briefcase,
    title: "Internship Support",
    description: "Learn how to get real UAE internship opportunities.",
    bgColor: "bg-purple-500/10",
    iconColor: "text-purple-600"
  },
  {
    icon: Home,
    title: "Accommodation Help",
    description: "Get help with relocation and trusted housing options.",
    bgColor: "bg-orange-500/10",
    iconColor: "text-orange-600"
  }
];

export default function StudentUSPSection() {
  const [visibleCards, setVisibleCards] = useState<boolean[]>(new Array(uspCards.length).fill(false));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleCards(prev => {
              const newState = [...prev];
              newState[index] = true;
              return newState;
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll('.usp-card');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why Choose <span className="text-primary">NextWave?</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Trust NextWave over Google searches or random agents. Get specialized UAE university admission support.
          </p>
        </div>

        {/* USP Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {uspCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                data-index={index}
                className={`usp-card group p-6 lg:p-8 rounded-2xl border border-gray-100 hover:border-primary/20 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${card.bgColor} ${
                  visibleCards[index] 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl ${card.bgColor} border border-current/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}