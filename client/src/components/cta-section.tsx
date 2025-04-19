import { Link } from "wouter";

export default function CTASection() {
  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Education Journey?</h2>
          <p className="text-xl mb-8">Let us help you find the perfect program and university that aligns with your goals.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/">
              <a className="bg-white text-primary px-6 py-3 rounded-md font-bold hover:bg-gray-100 transition">
                Find Programs
              </a>
            </Link>
            <Link href="/">
              <a className="bg-[#F7941D] text-white px-6 py-3 rounded-md font-bold hover:bg-opacity-90 transition">
                Get Guidance
              </a>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
