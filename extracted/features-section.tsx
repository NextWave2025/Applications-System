import {
  BadgeCheckIcon,
  ChartBarIcon,
  ClockIcon,
  CreditCardIcon,
  GlobeIcon,
  UsersIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface FeaturesSectionProps {
  className?: string;
}

export default function FeaturesSection({ className }: FeaturesSectionProps) {
  const features = [
    {
      icon: CreditCardIcon,
      title: "Fast Commission Payouts",
      description:
        "Receive your commissions quickly with our streamlined payment system. Track earnings in real-time and get paid within 30 days of student enrollment.",
    },
    {
      icon: GlobeIcon,
      title: "Full University Access",
      description:
        "Direct access to all partner universities in the UAE. Submit applications, track status, and communicate with admission officers all in one platform.",
    },
    {
      icon: UsersIcon,
      title: "Regional Support Team",
      description:
        "Our dedicated regional managers provide personalized support in your local language and time zone to help you succeed.",
    },
    {
      icon: BadgeCheckIcon,
      title: "Verified Programs",
      description:
        "All programs are verified and accredited, ensuring your students receive quality education and recognized qualifications.",
    },
    {
      icon: ChartBarIcon,
      title: "Performance Analytics",
      description:
        "Detailed analytics and reporting tools to track your performance, identify trends, and optimize your recruitment strategy.",
    },
    {
      icon: ClockIcon,
      title: "Quick Application Processing",
      description:
        "Fast-track application processing with pre-screened requirements and direct university connections for quicker decisions.",
    },
  ];

  return (
    <section className={cn("py-16 bg-muted/50 md:py-24", className)}>
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Key Features for Agents
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to successfully recruit students to UAE
            universities
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
