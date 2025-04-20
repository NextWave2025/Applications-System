import React from 'react';

export default function PartnerUniversitiesSection() {
  // You can replace these placeholders with actual university logos
  const universityLogos = Array.from({ length: 6 }).map((_, index) => (
    <div key={index} className="h-16 bg-gray-200 rounded flex items-center justify-center">
      {/* Placeholder for university logo */}
    </div>
  ));

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Partner Universities</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            We work with the top universities across the UAE
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {universityLogos}
        </div>
      </div>
    </section>
  );
}