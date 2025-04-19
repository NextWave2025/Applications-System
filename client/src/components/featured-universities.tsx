import { useQuery } from "@tanstack/react-query";
import { type University } from "@shared/schema";
import { Link } from "wouter";

export default function FeaturedUniversities() {
  const { data: universities = [], isLoading } = useQuery<University[]>({
    queryKey: ['/api/universities'],
  });

  return (
    <section className="py-16 bg-muted/30 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Our Partner Universities
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover top universities across the UAE
          </p>
        </div>
        
        {isLoading ? (
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex items-center justify-center rounded-lg bg-white p-4 shadow-sm animate-pulse">
                <div className="h-12 w-full bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
            {universities.slice(0, 6).map((university) => (
              <Link 
                href={`/?universityIds=${university.id}`} 
                key={university.id}
                className="flex items-center justify-center rounded-lg bg-white p-4 shadow-sm transition-all hover:shadow-md"
              >
                <img
                  src={university.imageUrl}
                  alt={university.name}
                  className="h-12 w-auto object-contain grayscale transition-all hover:grayscale-0"
                />
              </Link>
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center text-primary font-medium hover:underline">
            View All Universities
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
