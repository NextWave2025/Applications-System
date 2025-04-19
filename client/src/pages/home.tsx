import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/hero-section";
import FilterSidebar from "@/components/filter-sidebar";
import ProgramList from "@/components/program-list";
import FeaturedUniversities from "@/components/featured-universities";
import ServicesSection from "@/components/services-section";
import TestimonialsSection from "@/components/testimonials-section";
import CTASection from "@/components/cta-section";

export default function Home() {
  const [location] = useLocation();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  const [filters, setFilters] = useState({
    studyLevel: [] as string[],
    studyField: [] as string[],
    universityIds: [] as number[],
    maxTuition: 100000,
    duration: [] as string[],
    hasScholarship: null as boolean | null,
  });

  // Parse URL search params
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    setSearchParams(params);
    
    // Extract filters from URL if present
    const universityIds = params.get('universityIds');
    if (universityIds) {
      setFilters(prev => ({
        ...prev,
        universityIds: universityIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))
      }));
    }
  }, [location]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // Get search query from URL
  const searchQuery = searchParams?.get('search') || null;

  return (
    <>
      <Navbar />
      <HeroSection />
      
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row">
            <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
            <ProgramList filters={filters} searchQuery={searchQuery} />
          </div>
        </div>
      </section>
      
      <FeaturedUniversities />
      <ServicesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </>
  );
}
