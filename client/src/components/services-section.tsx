import { Link } from "wouter";

export default function ServicesSection() {
  const services = [
    {
      icon: "fas fa-search",
      title: "Program Finder",
      description: "Find the perfect program that matches your preferences and career goals.",
      link: "/",
    },
    {
      icon: "fas fa-clipboard-list",
      title: "Application Assistance",
      description: "Expert guidance through the entire application process for smoother admissions.",
      link: "/",
    },
    {
      icon: "fas fa-money-bill-wave",
      title: "Scholarship Guidance",
      description: "Discover scholarship opportunities and financial aid options suited to your profile.",
      link: "/",
    },
    {
      icon: "fas fa-user-tie",
      title: "Career Counseling",
      description: "Professional advice on career paths and program selection aligned with your goals.",
      link: "/",
    },
  ];

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Our Services</h2>
          <p className="text-gray-600">We provide comprehensive support for your education journey</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div className="bg-white p-6 rounded-lg shadow-sm text-center" key={index}>
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className={`${service.icon} text-2xl text-primary`}></i>
              </div>
              <h3 className="text-lg font-bold mb-2">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <Link href={service.link}>
                <a className="text-primary font-medium hover:underline">Learn More</a>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
