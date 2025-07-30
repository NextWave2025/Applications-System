import StudentHeroSection from "../components/student-hero-section";
import StudentUSPSection from "../components/student-usp-section";
import StudentJourneySection from "../components/student-journey-section";
import StudentTestimonialsSection from "../components/student-testimonials-section";
import PartnerUniversitiesSection from "../components/partner-universities-section";
import StudentCTASection from "../components/student-cta-section";
import ConsultationForm from "../components/consultation-form";
import StickyNav from "../components/sticky-nav";


export default function StudentLandingPage() {
  return (
    <>
      <StickyNav />
      <StudentHeroSection />
      <StudentUSPSection />
      <StudentJourneySection />
      <StudentTestimonialsSection />
      <PartnerUniversitiesSection />
      <StudentCTASection />
      <ConsultationForm />
    </>
  );
}