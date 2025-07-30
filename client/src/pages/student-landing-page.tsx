import StudentHeroSection from "../components/student-hero-section";
import WhyChooseUAESection from "../components/why-choose-uae-section";
import StudentFeaturesSection from "../components/student-features-section";
import PartnerUniversitiesSection from "../components/partner-universities-section";
import StudentTestimonialsSection from "../components/student-testimonials-section";
import StudentCTASection from "../components/student-cta-section";
import ConsultationForm from "../components/consultation-form";
import DocumentUpload from "../components/document-upload";

export default function StudentLandingPage() {
  return (
    <>
      <StudentHeroSection />
      <StudentFeaturesSection />
      <WhyChooseUAESection />
      <StudentTestimonialsSection />
      <PartnerUniversitiesSection />
      <StudentCTASection />
      <ConsultationForm />
      <DocumentUpload />
    </>
  );
}