import React, { useState, useEffect } from 'react';
import { GraduationCap, Globe, TrendingUp, Shield } from 'lucide-react';

export default function WhyChooseUAESection() {
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

    const section = document.getElementById('why-choose-uae-section');
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  // Define our features array
  const features = [
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "World-Class Education",
      description: "UAE universities offer internationally recognized degrees and partnerships with leading global institutions, ensuring students receive premium education.",
      gradient: "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Hub",
      description: "Strategic location connecting East and West, with a diverse multicultural environment and networking opportunities for international careers.",
      gradient: "bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Career Growth",
      description: "Access to thriving job markets in technology, finance, healthcare, and tourism with competitive salaries and rapid professional advancement.",
      gradient: "bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Quality of Life",
      description: "A safe environment with modern infrastructure, excellent healthcare, vibrant cultural experiences, and high standard of living for students.",
      gradient: "bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent"
    }
  ];

  return (
    <section id="why-choose-uae-section" className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Brand-inspired decorative elements */}
      <div className="absolute left-0 top-0 w-full h-32 bg-gradient-to-b from-white to-transparent pointer-events-none"></div>
      
      {/* Logo-inspired half-circle pattern */}
      <div className="absolute -right-32 bottom-0 w-64 h-64 border-8 border-primary/10 rounded-full half-circle-left opacity-50 pointer-events-none"></div>
      <div className="absolute -left-16 top-1/3 w-32 h-32 bg-primary/5 rounded-full opacity-30 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto mb-20 text-center">
          <div className="guide-badge-with-dot mb-6">
            Student Advantages
          </div>
          <h2 className="text-5xl md:text-[64px] font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            Why Choose <span className="text-primary">UAE</span> for Your Education?
          </h2>
          <p className="text-lg md:text-[25px] font-light text-gray-600 leading-relaxed max-w-3xl mx-auto mt-6">
            The United Arab Emirates offers exceptional educational opportunities with unique advantages for international students
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`group rounded-lg overflow-hidden shadow-lg bg-white transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{ transitionDelay: `${index * 150}ms`, minHeight: '400px' }}
            >
              {/* Top accent bar with brand color */}
              <div className="h-2 bg-primary"></div>
              
              {/* Inner content with proper spacing (80px min) */}
              <div className="p-8 relative h-full flex flex-col">
                {/* Background with G pattern */}
                <div className={`absolute inset-0 ${feature.gradient} opacity-60 pointer-events-none`}></div>
                <div className="absolute -right-12 -bottom-12 w-32 h-32 border-[6px] border-primary/5 rounded-tl-full transform rotate-90 opacity-30 pointer-events-none"></div>
                
                {/* Content */}
                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="mb-6 w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-[25px] font-bold text-gray-900 mb-4 leading-tight">
                    {feature.title}
                  </h3>
                  
                  <p className="text-[16px] font-light leading-relaxed text-gray-600 flex-1">
                    {feature.description}
                  </p>
                  
                  {/* Brand accent at bottom */}
                  <div className="mt-6 w-16 h-1 bg-primary/20 rounded-full group-hover:w-24 transition-all duration-300">
                    <div className="w-8 h-full bg-primary rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}