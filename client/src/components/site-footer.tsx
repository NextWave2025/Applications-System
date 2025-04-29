import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, ArrowRight, MapPin, Phone } from 'lucide-react';
import CustomLogo from './custom-logo';

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-black text-white relative overflow-hidden">
      {/* Brand-inspired decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
      <div className="absolute -left-32 bottom-0 w-64 h-64 bg-primary/5 rounded-tr-full opacity-20 pointer-events-none"></div>
      <div className="absolute right-0 top-0 w-80 h-80 transform -translate-y-1/2 pointer-events-none overflow-hidden">
        <div className="w-full h-full border-[20px] border-primary/5 rounded-full"></div>
      </div>
      
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Logo and Company Info - 4 columns */}
          <div className="md:col-span-4">
            <div className="mb-6">
              <CustomLogo variant="white" />
            </div>
            
            <p className="text-gray-400 font-light text-[16px] leading-relaxed mb-6 max-w-md">
              Connecting international students with premier UAE universities through our trusted network of education agents worldwide.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-primary mr-3" />
                <span className="text-gray-300 text-[16px] font-light">Dubai Media City, Dubai, UAE</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-3" />
                <span className="text-gray-300 text-[16px] font-light">info@guideuae.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-primary mr-3" />
                <span className="text-gray-300 text-[16px] font-light">+971 4 123 4567</span>
              </div>
            </div>
            
            {/* Social Icons */}
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors duration-300">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors duration-300">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors duration-300">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links - 2 columns */}
          <div className="md:col-span-2 md:ml-8">
            <h3 className="text-[25px] font-bold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary font-light text-[16px] transition-colors duration-200 flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary mr-2 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/programs" className="text-gray-400 hover:text-primary font-light text-[16px] transition-colors duration-200 flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary mr-2 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
                  Programs
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-primary font-light text-[16px] transition-colors duration-200 flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary mr-2 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-primary font-light text-[16px] transition-colors duration-200 flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary mr-2 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-primary font-light text-[16px] transition-colors duration-200 flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary mr-2 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Agent Resources - 3 columns */}
          <div className="md:col-span-3">
            <h3 className="text-[25px] font-bold mb-6 text-white">Agent Resources</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/become-agent" className="text-gray-400 hover:text-primary font-light text-[16px] transition-colors duration-200 flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary mr-2 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
                  Become an Agent
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-primary font-light text-[16px] transition-colors duration-200 flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary mr-2 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
                  Agent Login
                </Link>
              </li>
              <li>
                <Link to="/commissions" className="text-gray-400 hover:text-primary font-light text-[16px] transition-colors duration-200 flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary mr-2 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
                  Commission Structure
                </Link>
              </li>
              <li>
                <Link to="/marketing-materials" className="text-gray-400 hover:text-primary font-light text-[16px] transition-colors duration-200 flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary mr-2 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
                  Marketing Materials
                </Link>
              </li>
              <li>
                <Link to="/training" className="text-gray-400 hover:text-primary font-light text-[16px] transition-colors duration-200 flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary mr-2 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
                  Training Resources
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Newsletter - 3 columns */}
          <div className="md:col-span-3">
            <h3 className="text-[25px] font-bold mb-6 text-white">Newsletter</h3>
            <p className="text-gray-400 font-light text-[16px] leading-relaxed mb-6">
              Subscribe to our newsletter for the latest updates on programs and agent opportunities.
            </p>
            <div className="flex flex-col space-y-3">
              <input
                type="email"
                placeholder="Your email address"
                className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-primary font-light text-[16px] w-full"
              />
              <button
                type="button"
                className="bg-primary text-white px-5 py-3 rounded-lg font-medium text-[16px] hover:bg-primary/90 transition-colors duration-300 flex items-center justify-center"
              >
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Divider with brand styling */}
        <div className="h-px w-full bg-gray-800 mb-8 relative">
          <div className="absolute top-0 left-0 h-full w-24 bg-primary/50"></div>
        </div>
        
        {/* Copyright Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 font-light text-sm mb-4 md:mb-0">
            © {currentYear} Guide. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-gray-500 hover:text-primary text-sm font-light transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-primary text-sm font-light transition-colors duration-200">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-gray-500 hover:text-primary text-sm font-light transition-colors duration-200">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}