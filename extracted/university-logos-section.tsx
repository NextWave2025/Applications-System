import { cn } from "@/lib/utils";

interface UniversityLogosSectionProps {
  className?: string;
}

export default function UniversityLogosSection({
  className,
}: UniversityLogosSectionProps) {
  const universities = [
    {
      name: "University of Dubai",
      logo: "https://picsum.photos/seed/univ1/200/80",
    },
    {
      name: "American University of Sharjah",
      logo: "https://picsum.photos/seed/univ2/200/80",
    },
    {
      name: "Zayed University",
      logo: "https://picsum.photos/seed/univ3/200/80",
    },
    {
      name: "UAE University",
      logo: "https://picsum.photos/seed/univ4/200/80",
    },
    {
      name: "Khalifa University",
      logo: "https://picsum.photos/seed/univ5/200/80",
    },
    {
      name: "Abu Dhabi University",
      logo: "https://picsum.photos/seed/univ6/200/80",
    },
  ];

  return (
    <section className={cn("py-16 bg-muted/30 md:py-20", className)}>
      <div className="container">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Our Partner Universities
          </h2>
          <p className="text-lg text-muted-foreground">
            We work with the top universities across the UAE
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {universities.map((university, index) => (
            <div
              key={index}
              className="flex items-center justify-center rounded-lg bg-background p-4 shadow-sm transition-all hover:shadow-md"
            >
              <img
                src={university.logo}
                alt={university.name}
                className="h-12 w-auto object-contain grayscale transition-all hover:grayscale-0"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
