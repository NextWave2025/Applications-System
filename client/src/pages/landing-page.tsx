import HeroSection from "../components/hero-section";
import WhyChooseUAESection from "../components/why-choose-uae-section";
import AgentFeaturesSection from "../components/agent-features-section";
import PartnerUniversitiesSection from "../components/partner-universities-section";
import AgentTestimonialsSection from "../components/agent-testimonials-section";
import AgentCTASection from "../components/agent-cta-section";
import SiteFooter from "../components/site-footer";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <PartnerUniversitiesSection />
      <AgentFeaturesSection />
      <WhyChooseUAESection />
      <AgentTestimonialsSection />
      <AgentCTASection />
    </>
  );
}
