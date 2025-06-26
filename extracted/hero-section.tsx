import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <div className="relative bg-black text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id="grid"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <div className="container relative z-10 py-20 md:py-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Connecting Students to{" "}
            <span className="relative">
              UAE's
              <span className="absolute -bottom-1 left-0 h-1 w-full bg-white"></span>
            </span>{" "}
            Top Universities
          </h1>
          <p className="mt-6 text-lg text-gray-300 max-w-2xl">
            NextWave helps education agents connect international students with
            premier UAE universities. Maximize your commissions while providing
            students with life-changing opportunities.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              size="lg"
              className="bg-white text-black hover:bg-white/90"
            >
              <Link to="/signup">Become an Agent</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
            >
              <Link to="/programs">Explore Programs</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-white/5 rounded-tl-full"></div>
      <div className="absolute top-20 right-10 w-20 h-20 bg-white/5 rounded-full"></div>
      <div className="absolute bottom-20 left-10 w-16 h-16 bg-white/5 rounded-full"></div>
    </div>
  );
}
