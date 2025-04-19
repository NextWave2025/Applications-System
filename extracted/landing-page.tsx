import CTASection from "@/polymet/components/cta-section";
import FeaturesSection from "@/polymet/components/features-section";
import HeroSection from "@/polymet/components/hero-section";
import TestimonialsSection from "@/polymet/components/testimonials-section";
import UniversityLogosSection from "@/polymet/components/university-logos-section";
import WhyUAESection from "@/polymet/components/why-uae-section";

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      <HeroSection />
      <WhyUAESection />
      <FeaturesSection />
      <UniversityLogosSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
