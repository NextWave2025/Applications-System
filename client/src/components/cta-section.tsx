import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-primary-dark text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Educational Journey in the UAE?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Join thousands of students who have found their perfect
              educational path with NextWave. Our comprehensive platform makes
              the process easy and stress-free.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/programs" className="btn-primary-white text-center">
                Explore Programs
              </Link>
              <Link to="/signup" className="btn-outline-white text-center">
                Create Account
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full max-w-sm bg-white/10 rounded-full filter blur-2xl"></div>
            </div>
            <div className="relative bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8">
              <div className="bg-white/10 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold mb-2">
                  Why Choose NextWave?
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg
                      className="h-6 w-6 mr-2 text-white/80"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Access to 20+ UAE universities</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-6 w-6 mr-2 text-white/80"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Personalized program matching</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-6 w-6 mr-2 text-white/80"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Scholarship opportunities</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-6 w-6 mr-2 text-white/80"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Visa and accommodation support</span>
                  </li>
                </ul>
              </div>
              <div className="text-center">
                <p className="text-white/80 text-sm mb-3">
                  Join 5,000+ students who found their path
                </p>
                <Link to="/signup" className="btn-primary-white w-full">
                  Sign Up Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
