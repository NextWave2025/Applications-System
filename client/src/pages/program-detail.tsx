import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { type ProgramWithUniversity } from "@shared/schema";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function ProgramDetail() {
  const { id } = useParams();
  const programId = parseInt(id);

  const { data: program, isLoading, error } = useQuery<ProgramWithUniversity>({
    queryKey: [`/api/programs/${programId}`],
    enabled: !isNaN(programId),
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="h-80 bg-gray-200 rounded-lg animate-pulse mb-8"></div>
            <div className="h-12 bg-gray-200 rounded animate-pulse mb-4 w-3/4"></div>
            <div className="grid grid-cols-2 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-1/2"></div>
            <div className="space-y-2 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !program) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-xl mx-auto">
            <i className="fas fa-exclamation-circle text-5xl text-red-500 mb-4"></i>
            <h1 className="text-3xl font-bold mb-4">Program Not Found</h1>
            <p className="text-gray-600 mb-8">
              Sorry, we couldn't find the program you're looking for. It may have been moved or removed.
            </p>
            <Link href="/">
              <a className="bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition">
                Return to Program Listing
              </a>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="bg-gray-100">
        {/* Program Hero */}
        <div className="relative h-72 md:h-96 bg-gray-800">
          <img 
            src={program.imageUrl}
            alt={program.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent h-1/2"></div>
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
            <div className="container mx-auto">
              <div className="flex items-center mb-2">
                <Link href={`/?universityIds=${program.universityId}`}>
                  <a className="text-white hover:text-gray-200 transition">
                    {program.university.name}
                  </a>
                </Link>
                <span className="mx-2 text-white">•</span>
                <span className="text-white bg-primary bg-opacity-80 px-2 py-1 text-xs rounded">
                  {program.degree}
                </span>
                {program.hasScholarship && (
                  <span className="ml-2 text-white bg-[#28A745] bg-opacity-80 px-2 py-1 text-xs rounded">
                    Scholarship Available
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {program.name}
              </h1>
              <div className="flex items-center text-white text-sm">
                <i className="fas fa-map-marker-alt mr-2"></i>
                <span>{program.university.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Program Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            {/* Program Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <i className="fas fa-money-bill-wave text-primary text-xl mr-3"></i>
                  <h3 className="font-semibold">Tuition Fee</h3>
                </div>
                <p className="text-gray-700">{program.tuition}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <i className="fas fa-clock text-primary text-xl mr-3"></i>
                  <h3 className="font-semibold">Duration</h3>
                </div>
                <p className="text-gray-700">{program.duration}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <i className="fas fa-calendar-alt text-primary text-xl mr-3"></i>
                  <h3 className="font-semibold">Intake</h3>
                </div>
                <p className="text-gray-700">{program.intake}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <i className="fas fa-graduation-cap text-primary text-xl mr-3"></i>
                  <h3 className="font-semibold">Study Field</h3>
                </div>
                <p className="text-gray-700">{program.studyField}</p>
              </div>
            </div>

            {/* Entry Requirements */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Entry Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {program.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>

            {/* Apply Button */}
            <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between">
              <button className="bg-[#F7941D] text-white px-8 py-3 rounded-md font-bold hover:bg-opacity-90 transition mb-4 md:mb-0">
                Apply Now
              </button>
              <div className="flex space-x-4">
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md flex items-center hover:bg-gray-50 transition">
                  <i className="far fa-heart mr-2"></i> Save
                </button>
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md flex items-center hover:bg-gray-50 transition">
                  <i className="far fa-envelope mr-2"></i> Contact
                </button>
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md flex items-center hover:bg-gray-50 transition">
                  <i className="fas fa-share-alt mr-2"></i> Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
