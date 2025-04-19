import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Polymet</h3>
            <p className="text-gray-400 mb-4">
              Your trusted guide to finding the perfect study program in the UAE. We connect students with top universities and programs.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white">
                  Programs
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white">
                  Universities
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Services</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-white">
                  Program Finder
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white">
                  Application Assistance
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white">
                  Scholarship Guidance
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white">
                  Career Counseling
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white">
                  Student Visa Support
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-2"></i>
                <span>123 Business Bay, Dubai, UAE</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-phone-alt mt-1 mr-2"></i>
                <span>+971 4 123 4567</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-envelope mt-1 mr-2"></i>
                <span>info@polymet.ae</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Polymet. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
