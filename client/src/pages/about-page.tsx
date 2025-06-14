import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/main-layout";

export default function AboutPage() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About Guide</h1>
          <div className="prose prose-lg max-w-none">
            <p>
              NextWave is the #1 platform for admissions into educational
              institutions in the UAE. We connect students with the right
              programs and institutions to help them achieve their academic and
              career goals.
            </p>

            <h2>Our Mission</h2>
            <p>
              Our mission is to simplify the educational journey for students
              looking to study in the UAE. We believe that access to quality
              education should be straightforward, transparent, and available to
              all.
            </p>

            <h2>What We Offer</h2>
            <ul>
              <li>
                <strong>Comprehensive Database:</strong> Access to over 913
                programs across 31 universities in the UAE.
              </li>
              <li>
                <strong>Expert Guidance:</strong> Our team of education
                consultants provides personalized advice to help students find
                the perfect program.
              </li>
              <li>
                <strong>Seamless Application Process:</strong> We handle the
                application process from start to finish, making it stress-free
                for students.
              </li>
              <li>
                <strong>Visa and Accommodation Support:</strong> We provide
                guidance on visa applications and help students find suitable
                accommodation.
              </li>
              <li>
                <strong>Scholarship Opportunities:</strong> We connect students
                with scholarship opportunities to make education more
                affordable.
              </li>
            </ul>

            <h2>For Education Agents</h2>
            <p>
              We partner with education agents worldwide to help them place
              students in UAE institutions. Our agent portal provides
              comprehensive tools, resources, and support to make the process
              efficient and rewarding.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-primary text-center">
                Contact Us
              </Link>
              <Link to="/programs" className="btn-secondary text-center">
                Explore Programs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
