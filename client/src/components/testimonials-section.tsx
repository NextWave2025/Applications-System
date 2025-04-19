export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah K.",
      program: "BSc Computer Science, Abu Dhabi University",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50&q=80",
      quote: "Polymet made finding the right program incredibly easy. Their comprehensive database helped me discover the perfect Computer Science program that aligned with my career goals.",
      rating: 5,
    },
    {
      name: "Ahmed M.",
      program: "MBA, Ajman University",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50&q=80",
      quote: "The application assistance service saved me so much time and stress. The team guided me through every step of the process, making it smooth and straightforward.",
      rating: 4.5,
    },
    {
      name: "Fatima R.",
      program: "BSc Architecture, American University of Sharjah",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50&q=80",
      quote: "Thanks to Polymet's scholarship guidance, I secured a partial scholarship for my Architecture program. Their expertise and resources were invaluable in my education journey.",
      rating: 5,
    },
  ];

  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star"></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }

    return stars;
  };

  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">What Our Students Say</h2>
          <p className="text-gray-600">Hear from students who found their perfect program through Polymet</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div className="bg-white p-6 rounded-lg shadow-sm" key={index}>
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.program}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">"{testimonial.quote}"</p>
              <div className="flex text-yellow-400">
                {renderRating(testimonial.rating)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
