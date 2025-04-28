export default function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      quote: "Guide helped me find the perfect program at American University of Sharjah. The application process was smooth, and I got accepted with a partial scholarship!",
      name: "Sarah Ahmed",
      role: "Computer Science Student",
      image: "https://randomuser.me/api/portraits/women/1.jpg",
    },
    {
      id: 2,
      quote: "I was overwhelmed by all the university options in the UAE. Guide's platform made it easy to compare programs and find the one that matched my career goals.",
      name: "Mohammed Al-Farsi",
      role: "Business Administration Student",
      image: "https://randomuser.me/api/portraits/men/2.jpg",
    },
    {
      id: 3,
      quote: "As an international student, I was worried about the visa process. Guide's team guided me through every step, making my transition to studying in Dubai seamless.",
      name: "Priya Sharma",
      role: "Engineering Student",
      image: "https://randomuser.me/api/portraits/women/3.jpg",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Students Say
          </h2>
          <p className="text-lg text-gray-600">
            Thousands of students have found their ideal programs through our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-lg shadow p-8 relative"
            >
              <div className="mb-6">
                <svg
                  className="h-10 w-10 text-primary/20"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                >
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-6">{testimonial.quote}</p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}