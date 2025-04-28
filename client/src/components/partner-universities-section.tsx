import React from "react";

// Import university logos
import abuDhabiUniLogo from "@assets/university-logos/abu_dhabi_uni.jpg";
import birminghamUniLogo from "@assets/university-logos/birmingham_uni.png";
import dubaiUniLogo from "@assets/university-logos/dubai_uni.png";
import gulfMedicalUniLogo from "@assets/university-logos/gulf_medical_unipng.png";
import heriotWattUniLogo from "@assets/university-logos/heriot_watt_uni.svg";
import middlesexDubaiLogo from "@assets/university-logos/middlesex_dubai_dubai.png";
import skylineUniLogo from "@assets/university-logos/skyline_uni.png";
import ukCollegeLogo from "@assets/university-logos/uk_college.webp";

// Define the partner universities with their logos
const partnerUniversities = [
  { name: "University of Dubai", logo: dubaiUniLogo },
  { name: "Abu Dhabi University", logo: abuDhabiUniLogo },
  { name: "University of Birmingham Dubai", logo: birminghamUniLogo },
  { name: "Heriot-Watt University Dubai", logo: heriotWattUniLogo },
  { name: "Middlesex University Dubai", logo: middlesexDubaiLogo },
  { name: "Gulf Medical University", logo: gulfMedicalUniLogo },
  { name: "Skyline University College", logo: skylineUniLogo },
  { name: "UK College of Business & Computing", logo: ukCollegeLogo },
];

export default function PartnerUniversitiesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Partner Universities
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            We work with the top universities across the UAE
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {partnerUniversities.map((university, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-center p-6 h-24"
            >
              <img
                src={university.logo}
                alt={university.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
