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
        <div className="flex justify-center items-center">
          {/* Centered container with logo and navigation inline */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img 
                src="/logos/nextwave-primary-new.png" 
                alt="NextWave Logo" 
                className="h-12 object-contain"
              />
            </Link>
            
            {/* Navigation Links - Inline with logo */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-800 hover:text-[#41326B] font-semibold text-lg transition-colors">
                Programs
              </Link>
              <Link href="/" className="text-gray-800 hover:text-[#41326B] font-semibold text-lg transition-colors">
                About Us
              </Link>
              <Link href="/" className="text-gray-800 hover:text-[#41326B] font-semibold text-lg transition-colors">
                Contact
              </Link>
            </div>
            
            {/* Auth buttons - Inline */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="hidden md:block text-gray-800 hover:text-[#41326B] font-semibold text-lg transition-colors">
                Login
              </Link>
              <Link href="/" className="bg-secondary text-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-all shadow-lg">
                Apply Now
              </Link>
              <button 
                className="md:hidden text-black" 
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
                style={{color: '#000000'}}
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/" className="block px-3 py-2 text-black hover:bg-gray-100 rounded-md font-bold" style={{color: '#000000'}}>
              Programs
            </Link>
            <Link href="/" className="block px-3 py-2 text-black hover:bg-gray-100 rounded-md font-bold" style={{color: '#000000'}}>
              About Us
            </Link>
            <Link href="/" className="block px-3 py-2 text-black hover:bg-gray-100 rounded-md font-bold" style={{color: '#000000'}}>
              Contact
            </Link>
            <Link href="/" className="block px-3 py-2 text-black hover:bg-gray-100 rounded-md font-bold" style={{color: '#000000'}}>
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
