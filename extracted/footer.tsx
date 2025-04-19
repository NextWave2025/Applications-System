import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
} from "lucide-react";

import Logo from "@/polymet/components/logo";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo variant="white" />
            <p className="text-sm text-gray-300">
              Connecting international students with top UAE universities
              through trusted education agents.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-white hover:bg-white/20"
                asChild
              >
                <a href="https://facebook.com" target="_blank" rel="noreferrer">
                  <FacebookIcon className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-white hover:bg-white/20"
                asChild
              >
                <a href="https://twitter.com" target="_blank" rel="noreferrer">
                  <TwitterIcon className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-white hover:bg-white/20"
                asChild
              >
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <InstagramIcon className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-white hover:bg-white/20"
                asChild
              >
                <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                  <LinkedinIcon className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </a>
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-300 hover:text-white hover:underline"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/programs"
                  className="text-sm text-gray-300 hover:text-white hover:underline"
                >
                  Programs
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-300 hover:text-white hover:underline"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-300 hover:text-white hover:underline"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-300 hover:text-white hover:underline"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Agent Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/signup"
                  className="text-sm text-gray-300 hover:text-white hover:underline"
                >
                  Become an Agent
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-sm text-gray-300 hover:text-white hover:underline"
                >
                  Agent Login
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-300 hover:text-white hover:underline"
                >
                  Commission Structure
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-300 hover:text-white hover:underline"
                >
                  Marketing Materials
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-300 hover:text-white hover:underline"
                >
                  Training Resources
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Newsletter</h3>
            <p className="text-sm text-gray-300">
              Subscribe to our newsletter for the latest updates on programs and
              agent opportunities.
            </p>
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />

              <Button className="bg-white text-black hover:bg-white/90">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-white/20 pt-6 text-center text-sm text-gray-300">
          <p>&copy; {new Date().getFullYear()} Guide. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
