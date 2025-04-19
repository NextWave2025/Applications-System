import { useQuery } from "@tanstack/react-query";
import { type University } from "@shared/schema";
import { Link } from "wouter";

export default function FeaturedUniversities() {
  const { data: universities = [], isLoading } = useQuery<University[]>({
    queryKey: ['/api/universities'],
  });

  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Featured Universities</h2>
          <p className="text-gray-600">Discover top universities across the UAE</p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mb-3"></div>
                <div className="w-full h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {universities.slice(0, 6).map((university) => (
              <Link href={`/?universityIds=${university.id}`} key={university.id}>
                <a className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition">
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-3 bg-gray-100">
                    <img
                      src={university.imageUrl}
                      alt={university.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-center text-sm font-medium">{university.name}</span>
                </a>
              </Link>
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Link href="/">
            <a className="text-primary font-medium hover:underline">
              View All Universities <i className="fas fa-arrow-right ml-1"></i>
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
}
