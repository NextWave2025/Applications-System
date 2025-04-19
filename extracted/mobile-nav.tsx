import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MenuIcon } from "lucide-react";

import Logo from "@/polymet/components/logo";

interface MobileNavProps {
  variant?: "default" | "white";
}

export default function MobileNav({ variant = "default" }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={variant === "white" ? "text-white" : ""}
        >
          <MenuIcon className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader className="border-b pb-5">
          <SheetTitle asChild>
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="why-uae">
              <AccordionTrigger>Why UAE</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/"
                    className="text-sm hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    World-class Education
                  </Link>
                  <Link
                    to="/"
                    className="text-sm hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    Global Hub
                  </Link>
                  <Link
                    to="/"
                    className="text-sm hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    Career Growth
                  </Link>
                  <Link
                    to="/"
                    className="text-sm hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    Quality of Life
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="for-agents">
              <AccordionTrigger>For Agents</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/"
                    className="text-sm hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    Benefits
                  </Link>
                  <Link
                    to="/"
                    className="text-sm hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    Commission Structure
                  </Link>
                  <Link
                    to="/"
                    className="text-sm hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    Support Services
                  </Link>
                  <Link
                    to="/"
                    className="text-sm hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    Become an Agent
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="programs">
              <AccordionTrigger>Programs</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/programs"
                    className="text-sm hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    Browse All Programs
                  </Link>
                  <Link
                    to="/programs"
                    className="text-sm hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    Undergraduate
                  </Link>
                  <Link
                    to="/programs"
                    className="text-sm hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    Postgraduate
                  </Link>
                  <Link
                    to="/programs"
                    className="text-sm hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    Doctoral
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="flex flex-col gap-2 pt-4 border-t">
            <Button asChild variant="outline" className="w-full">
              <Link to="/login" onClick={() => setOpen(false)}>
                Sign In
              </Link>
            </Button>
            <Button
              asChild
              className="w-full bg-black text-white hover:bg-black/90"
            >
              <Link to="/signup" onClick={() => setOpen(false)}>
                Sign Up
              </Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
