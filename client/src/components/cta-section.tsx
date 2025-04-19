import { Link } from "wouter";

export default function CTASection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="rounded-xl bg-gradient-to-r from-primary to-primary/80 p-8 md:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Start Your Education Journey?
            </h2>
            <p className="mb-8 text-lg text-white/90">
              Let us help you find the perfect program and university that aligns with your goals.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/" className="w-full sm:w-auto">
                <button className="bg-white text-primary hover:bg-white/90 w-full px-8 py-3 rounded-md font-medium transition-colors">
                  Find Programs
                </button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <button className="border border-white text-white hover:bg-white/10 w-full px-8 py-3 rounded-md font-medium transition-colors">
                  Get Guidance
                </button>
              </Link>
            </div>
            
            {/* Decorative elements */}
            <div className="relative mt-10 pt-8 border-t border-white/20 max-w-md mx-auto">
              <div className="flex items-center justify-center text-sm text-white/70">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                  <line x1="4" y1="22" x2="4" y2="15"></line>
                </svg>
                Trusted by thousands of students worldwide
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
