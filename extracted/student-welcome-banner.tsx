import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRightIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface StudentWelcomeBannerProps {
  className?: string;
  userName?: string;
}

export default function StudentWelcomeBanner({
  className,
  userName = "Student",
}: StudentWelcomeBannerProps) {
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
      <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/welcome456/1200/800')] bg-cover bg-center opacity-10"></div>
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
            Welcome, {userName}!
          </h2>
          <p className="mb-6 text-white/90">
            Your student dashboard gives you access to all UAE university
            programs, application tracking, and program bookmarks. Here are some
            tips to get started:
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
                <Link to="/programs">
                  Browse now <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div className="rounded-lg bg-white/10 p-4 text-white backdrop-blur-sm">
              <h3 className="mb-2 font-semibold">Track Applications</h3>
              <p className="mb-2 text-sm text-white/90">
                Monitor the status of your submitted applications and complete
                drafts.
              </p>
              <Button
                variant="link"
                className="flex items-center gap-1 p-0 text-white"
                asChild
              >
                <Link to="/student/applications">
                  View applications <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div className="rounded-lg bg-white/10 p-4 text-white backdrop-blur-sm">
              <h3 className="mb-2 font-semibold">Saved Programs</h3>
              <p className="mb-2 text-sm text-white/90">
                Access your bookmarked programs and start new applications.
              </p>
              <Button
                variant="link"
                className="flex items-center gap-1 p-0 text-white"
                asChild
              >
                <Link to="/student/saved">
                  View saved <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
