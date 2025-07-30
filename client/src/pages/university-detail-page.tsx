import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { University, ProgramWithUniversity } from "@shared/schema";
import { useAuth } from "../hooks/use-auth";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { MapPin, Globe, Mail, Phone, Users, BookOpen, Award, ExternalLink } from "lucide-react";
import ProgramCardNew from "../components/program-card-new";

interface UniversityWithPrograms extends University {
  programs?: ProgramWithUniversity[];
}

export default function UniversityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "programs" | "admissions">("overview");

  // Fetch university details
  const { data: university, isLoading: universityLoading, error: universityError } = useQuery<UniversityWithPrograms>({
    queryKey: [`/api/universities/${id}`],
    enabled: !!id,
    staleTime: 60000,
    retry: 3,
  });

  // Fetch programs for this university
  const { data: programs = [], isLoading: programsLoading } = useQuery<ProgramWithUniversity[]>({
    queryKey: [`/api/programs?universityId=${id}`],
    enabled: !!id,
    staleTime: 60000,
    retry: 3,
  });

  if (universityLoading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded mb-6"></div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded mb-6"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (universityError || !university) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">University Not Found</h2>
            <p className="text-gray-600 mb-6">The university you're looking for could not be found.</p>
            <Link href="/programs" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90">
              Explore All Programs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link href="/" className="hover:text-primary">Home</Link>
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-gray-400 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <Link href="/programs" className="hover:text-primary">Programs</Link>
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-gray-400 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-900 font-medium">{university.name}</span>
              </li>
            </ol>
          </nav>

          {/* University Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0">
              {university.imageUrl ? (
                <img 
                  src={university.imageUrl} 
                  alt={university.name} 
                  className="w-24 h-24 object-contain rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 bg-primary/10 rounded-lg border border-gray-200 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-primary" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{university.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{university.location}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <Globe className="w-4 h-4 mr-1" />
                  <span>Official University Website</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <Users className="w-3 h-3 mr-1" />
                  {programs.length} Programs Available
                </Badge>
                <Badge variant="outline">UAE Institution</Badge>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setLocation('/programs')}
                className="gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Explore Programs
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BookOpen },
              { id: 'programs', label: 'Programs', icon: Award },
              { id: 'admissions', label: 'Admissions', icon: Users },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About {university.name}</h2>
                  <div className="prose max-w-none text-gray-700">
                    <p className="mb-4">
                      {university.name} is a prestigious educational institution located in {university.location}, 
                      United Arab Emirates. The university offers comprehensive programs designed to prepare 
                      students for successful careers in various fields.
                    </p>
                    <p className="mb-4">
                      With a commitment to academic excellence and innovation, the university provides 
                      state-of-the-art facilities, experienced faculty, and a supportive learning environment 
                      that fosters both intellectual and personal growth.
                    </p>
                    <p>
                      Students at {university.name} benefit from industry connections, internship opportunities, 
                      and career support services that help them transition successfully from academic life 
                      to professional careers.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{programs.length}</div>
                    <div className="text-sm text-gray-600">Programs Offered</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-lg font-bold text-gray-900">UAE</div>
                    <div className="text-sm text-gray-600">Location</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-lg font-bold text-gray-900">Accredited</div>
                    <div className="text-sm text-gray-600">Institution</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location</span>
                      <span className="font-medium text-gray-900">{university.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Programs Available</span>
                      <span className="font-medium text-gray-900">{programs.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type</span>
                      <span className="font-medium text-gray-900">Private University</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language</span>
                      <span className="font-medium text-gray-900">English</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>Contact via official website</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'programs' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Programs</h2>
              <Badge variant="secondary">{programs.length} Programs</Badge>
            </div>

            {programsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : programs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {programs.map((program) => (
                  <ProgramCardNew
                    key={program.id}
                    program={program}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Programs Found</h3>
                <p className="text-gray-600">This university currently has no programs listed.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'admissions' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Admission Requirements</h2>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">General Requirements</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Completed high school diploma or equivalent</li>
                      <li>English proficiency test scores (IELTS/TOEFL)</li>
                      <li>Academic transcripts</li>
                      <li>Passport copy</li>
                      <li>Personal statement</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Additional Documents</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Letters of recommendation</li>
                      <li>Portfolio (for design/arts programs)</li>
                      <li>Work experience certificates (if applicable)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Process</h2>
                <div className="space-y-4">
                  {[
                    { step: 1, title: "Choose Program", desc: "Browse and select your preferred program" },
                    { step: 2, title: "Submit Application", desc: "Complete the online application form" },
                    { step: 3, title: "Document Review", desc: "University reviews your documents" },
                    { step: 4, title: "Admission Decision", desc: "Receive your admission decision" },
                    { step: 5, title: "Enrollment", desc: "Complete enrollment and visa process" },
                  ].map(({ step, title, desc }) => (
                    <div key={step} className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {step}
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-900">{title}</h3>
                        <p className="text-sm text-gray-600">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <Button 
                    onClick={() => setLocation('/programs')}
                    className="w-full"
                  >
                    Start Your Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}