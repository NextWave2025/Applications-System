import { useState } from "react";
import { Link } from "wouter";
import CustomLogo from '../custom-logo';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center relative">
          {/* Logo - Centered */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img 
                src="/logos/nextwave-primary-new.png" 
                alt="NextWave Logo" 
                className="h-68 object-contain"
              />
            </Link>
          </div>
          
          {/* Navigation Links - Positioned to the right of logo with normal spacing */}
          <div className="hidden md:flex items-center space-x-6 ml-8">
            <Link href="/" className="text-gray-700 hover:text-primary font-medium">
              Programs
            </Link>
            <Link href="/" className="text-gray-700 hover:text-primary font-medium">
              About Us
            </Link>
            <Link href="/" className="text-gray-700 hover:text-primary font-medium">
              Contact
            </Link>
          </div>
          
          {/* Auth buttons - Positioned to the right */}
          <div className="flex items-center space-x-4 ml-6">
            <Link href="/" className="hidden md:block text-gray-700 hover:text-primary font-medium">
              Login
            </Link>
            <Link href="/" className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition">
              Apply Now
            </Link>
            <button 
              className="md:hidden text-gray-700" 
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              Programs
            </Link>
            <Link href="/" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              About Us
            </Link>
            <Link href="/" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              Contact
            </Link>
            <Link href="/" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
