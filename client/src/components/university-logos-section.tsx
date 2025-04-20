import { useQuery } from "@tanstack/react-query";

export default function UniversityLogosSection() {
  const { data: universities = [], isLoading } = useQuery({
    queryKey: ['/api/universities'],
  });

  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center flex-wrap gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="w-32 h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-semibold text-gray-900 mb-8">
          Trusted by Top Universities in the UAE
        </h2>
        <div className="flex justify-center flex-wrap gap-8 sm:gap-12">
          {(universities as any[]).length > 0 ? (
            (universities as any[]).slice(0, 6).map((university) => (
              <div 
                key={university.id} 
                className="flex items-center grayscale hover:grayscale-0 transition-all duration-300"
              >
                {university.logo ? (
                  <img
                    src={university.logo}
                    alt={university.name}
                    className="h-12 sm:h-16 w-auto object-contain"
                  />
                ) : (
                  <div className="text-lg font-semibold text-gray-700">{university.name}</div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">University listings coming soon.</p>
          )}
        </div>
      </div>
    </section>
  );
}