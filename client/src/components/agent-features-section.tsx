import React, { useState, useEffect } from 'react';
import { Globe, DollarSign, Users, LayoutDashboard, Megaphone, BookOpen } from 'lucide-react';

export default function AgentFeaturesSection() {
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

    const section = document.getElementById('agent-features-section');
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  const features = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'UAE University Access',
      description: 'Access 31+ licensed UAE universities in one dashboard with real-time updates on programs, tuition, and scholarships.',
      color: 'from-primary/10 to-primary/5'
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'High Commissions',
      description: 'Earn top-tier commissions with our transparent payment structure, guaranteed prompt payouts, and no hidden fees.',
      color: 'from-amber-500/10 to-amber-500/5'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Agent Onboarding & Support',
      description: 'Personal WhatsApp onboarding with your region expert plus dedicated visa checklist and process mapped by country with 24/7 support.',
      color: 'from-blue-500/10 to-blue-500/5'
    },
    {
      icon: <LayoutDashboard className="w-6 h-6" />,
      title: 'Portal & CRM',
      description: 'Track student applications, documents, and communication in one place with no need for external tools or complicated systems.',
      color: 'from-violet-500/10 to-violet-500/5'
    },
    {
      icon: <Megaphone className="w-6 h-6" />,
      title: 'Marketing Support',
      description: 'Get ready-to-use content kits, professionally designed flyers, videos, and campaign ideas you can implement immediately.',
      color: 'from-green-500/10 to-green-500/5'
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Student Support Network',
      description: 'Connect your students to our 2,000+ student community in UAE that helps them network and access internships and workshops.',
      color: 'from-cyan-500/10 to-cyan-500/5'
    }
  ];

  // Create G pattern background element
  const GPatternElement = () => (
    <div className="absolute -right-8 bottom-0 w-32 h-32 opacity-10 pointer-events-none transform rotate-180">
      <div className="w-full h-full border-[6px] border-primary rounded-tl-full"></div>
    </div>
  );

  return (
    <section id="agent-features-section" className="py-24 bg-white relative overflow-hidden">
      {/* Brand-inspired background elements - adjusted for mobile/tablet */}
      <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
      <div className="absolute -left-16 top-1/4 w-32 h-32 bg-primary/5 rounded-full opacity-40 pointer-events-none hidden md:block"></div>
      <div className="absolute right-0 bottom-0 w-64 h-64 rounded-tl-full bg-primary/5 opacity-20 pointer-events-none hidden md:block"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <div className="nextwave-badge-with-dot mb-6">
            Exclusive Benefits
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            What You Get as Our <span className="text-primary">Partner</span>
          </h2>
          <p className="text-lg md:text-xl font-light text-gray-600 max-w-3xl mx-auto mt-6">
            Join NextWave, the #1 platform for admission in UAE and enjoy these exclusive benefits designed to maximize your success
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-lg border border-gray-100 p-8 shadow-lg overflow-hidden transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{ transitionDelay: `${index * 100}ms`, minHeight: '320px' }}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-30 pointer-events-none`}></div>

              {/* Content with proper spacing */}
              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-6">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                  {feature.title}
                </h3>

                <p className="text-base font-light leading-relaxed text-gray-600 mt-2 flex-grow">
                  {feature.description}
                </p>

                <div className="mt-6 w-12 h-1 bg-primary/20 rounded-full">
                  <div className="w-6 h-full bg-primary rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}