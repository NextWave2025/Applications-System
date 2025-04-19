import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRightIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface WelcomeBannerProps {
  className?: string;
  userName?: string;
}

export default function WelcomeBanner({
  className,
  userName = "Agent",
}: WelcomeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-gradient-to-r from-primary to-primary/80",
        className
      )}
    >
      <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/welcome123/1200/800')] bg-cover bg-center opacity-10"></div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 text-white hover:bg-white/10"
        onClick={() => setDismissed(true)}
      >
        <XIcon className="h-4 w-4" />
      </Button>
      <CardContent className="relative p-6">
        <div className="max-w-3xl">
          <h2 className="mb-2 text-2xl font-bold text-white">
            Welcome back, {userName}!
          </h2>
          <p className="mb-6 text-white/90">
            Your agent dashboard gives you access to all UAE university
            programs, application tracking, and commission management. Here are
            some tips to get started:
          </p>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-lg bg-white/10 p-4 text-white backdrop-blur-sm">
              <h3 className="mb-2 font-semibold">Explore Programs</h3>
              <p className="mb-2 text-sm text-white/90">
                Browse through our catalog of programs from top UAE
                universities.
              </p>
              <Button
                variant="link"
                className="flex items-center gap-1 p-0 text-white"
                asChild
              >
                <Link to="/dashboard/programs">
                  Browse now <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div className="rounded-lg bg-white/10 p-4 text-white backdrop-blur-sm">
              <h3 className="mb-2 font-semibold">Submit Applications</h3>
              <p className="mb-2 text-sm text-white/90">
                Start submitting student applications and track their progress.
              </p>
              <Button
                variant="link"
                className="flex items-center gap-1 p-0 text-white"
                asChild
              >
                <Link to="/dashboard/applications">
                  Start now <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div className="rounded-lg bg-white/10 p-4 text-white backdrop-blur-sm">
              <h3 className="mb-2 font-semibold">Track Commissions</h3>
              <p className="mb-2 text-sm text-white/90">
                Monitor your earnings and upcoming commission payments.
              </p>
              <Button
                variant="link"
                className="flex items-center gap-1 p-0 text-white"
                asChild
              >
                <Link to="/dashboard/commissions">
                  View earnings <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
