import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/polymet/components/logo";
import MobileNav from "@/polymet/components/mobile-nav";
import NavigationMenu from "@/polymet/components/navigation-menu";

interface HeaderProps {
  variant?: "default" | "transparent";
}

export default function Header({ variant = "default" }: HeaderProps) {
  return (
    <header
      className={`w-full ${
        variant === "transparent"
          ? "absolute top-0 z-10 bg-transparent text-white"
          : "bg-white text-black"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/">
            <Logo variant={variant === "transparent" ? "white" : "default"} />
          </Link>
          <NavigationMenu />
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <Link to="/login">
              <Button
                variant={variant === "transparent" ? "outline" : "ghost"}
                size="sm"
              >
                Login
              </Button>
            </Link>
          </div>
          <div className="hidden md:block">
            <Link to="/signup">
              <Button
                variant={variant === "transparent" ? "default" : "outline"}
                size="sm"
              >
                Sign Up
              </Button>
            </Link>
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
