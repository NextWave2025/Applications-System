import React from 'react';
import { Link } from 'react-router-dom';

export default function AgentCTASection() {
  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Education Agency?</h2>
        <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
          Join our network of successful agents and start placing students in top UAE universities today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/signup"
            className="bg-white text-gray-900 px-6 py-3 rounded-md font-medium"
          >
            Join as Agent
          </Link>
          <Link
            to="/contact"
            className="bg-transparent border border-white/30 text-white px-6 py-3 rounded-md font-medium"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </section>
  );
}