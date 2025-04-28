import React from "react";

export default function AgentTestimonialsSection() {
  const testimonials = [
    {
      quote:
        "Working with Polymet has transformed our agency. The platform is intuitive, and the commission structure is the best in the industry.",
    },
    {
      quote:
        "The visa support tools have been a game-changer for our Indian students. The country-specific checklists and requirements save us so much time.",
    },
    {
      quote:
        "The marketing materials provided are professional and effective. Our conversion rates have improved significantly since partnering with Guide.",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Agents Say
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Hear from education agents who are successfully placing students in
            UAE universities
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white border rounded-lg p-6">
              <div className="text-3xl text-gray-300 mb-4">&ldquo;</div>
              <p className="text-gray-700 mb-4">{testimonial.quote}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
