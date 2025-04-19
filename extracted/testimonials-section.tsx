import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { QuoteIcon } from "lucide-react";

interface TestimonialsSectionProps {
  className?: string;
}

export default function TestimonialsSection({
  className,
}: TestimonialsSectionProps) {
  const testimonials = [
    {
      quote:
        "Working with Polymet has transformed our agency. The platform is intuitive, and the commission structure is the best in the industry. We've increased our UAE placements by 200% in just one year.",
      name: "Sarah Ahmed",
      title: "Director, Global Education Consultants",
      avatar: "https://github.com/yusufhilmi.png",
    },
    {
      quote:
        "The visa support tools have been a game-changer for our Indian students. The country-specific checklists and embassy contacts save us hours of research for each application.",
      name: "Rajiv Patel",
      title: "CEO, Pathway Education Services",
      avatar: "https://github.com/furkanksl.png",
    },
    {
      quote:
        "The marketing materials provided are professional and effective. Our conversion rates have improved significantly since we started using the co-branded templates.",
      name: "Maria Rodriguez",
      title: "Marketing Manager, EduConnect",
      avatar: "https://github.com/kdrnp.png",
    },
  ];

  return (
    <section className={cn("py-16 md:py-24", className)}>
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            What Our Agents Say
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear from education agents who are successfully placing students in
            UAE universities
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <QuoteIcon className="mb-4 h-8 w-8 text-primary/40" />
                <p className="mb-6 text-lg">{testimonial.quote}</p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src={testimonial.avatar}
                      alt={testimonial.name}
                    />

                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.title}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
