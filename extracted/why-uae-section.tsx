import {
  CheckIcon,
  GlobeIcon,
  GraduationCapIcon,
  TrendingUpIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WhyUAESectionProps {
  className?: string;
}

export default function WhyUAESection({ className }: WhyUAESectionProps) {
  const features = [
    {
      icon: GraduationCapIcon,
      title: "World-Class Education",
      description:
        "UAE universities offer internationally recognized degrees and partnerships with leading global institutions.",
    },
    {
      icon: GlobeIcon,
      title: "Global Hub",
      description:
        "Strategic location connecting East and West, with a diverse multicultural environment and global networking opportunities.",
    },
    {
      icon: TrendingUpIcon,
      title: "Career Growth",
      description:
        "Access to thriving job markets in technology, finance, healthcare, and tourism with competitive salaries.",
    },
    {
      icon: CheckIcon,
      title: "Quality of Life",
      description:
        "Safe environment with modern infrastructure, excellent healthcare, and vibrant cultural experiences.",
    },
  ];

  return (
    <section className={cn("py-16 md:py-24", className)}>
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Why Choose UAE for Higher Education?
          </h2>
          <p className="text-lg text-muted-foreground">
            The United Arab Emirates offers exceptional educational
            opportunities with unique advantages for international students.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
