import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  BookOpen, 
  GraduationCap, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  MessageSquare,
  Heart,
  Search,
  FileText,
  Globe
} from "lucide-react";

interface Application {
  id: number;
  programName: string;
  universityName: string;
  status: string;
  submittedAt: string;
  updatedAt: string;
}

interface Program {
  id: number;
  name: string;
  universityName: string;
  degree: string;
  tuitionFee: number;
  duration: string;
}

export default function StudentDashboardPage() {
  const [, setLocation] = useLocation();
  
  // Fetch user's applications
  const { data: applications = [], isLoading: applicationsLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
    retry: false
  });

  // Fetch recommended programs
  const { data: recommendedPrograms = [], isLoading: programsLoading } = useQuery<Program[]>({
    queryKey: ["/api/programs", { limit: 6 }],
    retry: false
  });

  // Calculate application progress
  const getApplicationProgress = () => {
    if (applications.length === 0) return 0;
    const completedApps = applications.filter(app => 
      app.status === 'accepted' || app.status === 'enrolled'
    ).length;
    return (completedApps / applications.length) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'enrolled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'under_review': return <AlertCircle className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      case 'enrolled': return <GraduationCap className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600">Welcome back! Track your university applications and discover new opportunities.</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" asChild>
                <Link href="/programs">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Programs
                </Link>
              </Button>
              <Button className="bg-secondary hover:bg-yellow-400 text-black" asChild>
                <Link href="/apply">
                  <BookOpen className="w-4 h-4 mr-2" />
                  New Application
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.filter(app => app.status === 'accepted').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.filter(app => app.status === 'pending' || app.status === 'under_review').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(getApplicationProgress())}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="recommended">Recommended Programs</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracker</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Application Status
                </CardTitle>
                <CardDescription>
                  Track the progress of your university applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div key={application.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{application.programName}</h3>
                            <p className="text-sm text-gray-600">{application.universityName}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Applied: {new Date(application.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={getStatusColor(application.status)}>
                              {getStatusIcon(application.status)}
                              <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
                            </Badge>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/applications/${application.id}`}>View Details</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                    <p className="text-gray-600 mb-4">Start your journey by applying to UAE universities</p>
                    <Button className="bg-secondary hover:bg-yellow-400 text-black" asChild>
                      <Link href="/programs">Browse Programs</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommended" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Recommended for You
                </CardTitle>
                <CardDescription>
                  Programs that match your interests and profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                {programsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-48 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendedPrograms.map((program) => (
                      <Card key={program.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">{program.name}</CardTitle>
                          <CardDescription>{program.universityName}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <GraduationCap className="w-4 h-4 mr-2" />
                              {program.degree}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="w-4 h-4 mr-2" />
                              {program.duration}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Globe className="w-4 h-4 mr-2" />
                              AED {program.tuitionFee?.toLocaleString()}
                            </div>
                          </div>
                          <div className="mt-4 space-y-2">
                            <Button variant="outline" size="sm" className="w-full" asChild>
                              <Link href={`/programs/${program.id}`}>View Details</Link>
                            </Button>
                            <Button size="sm" className="w-full bg-secondary hover:bg-yellow-400 text-black" asChild>
                              <Link href={`/apply/${program.id}`}>Apply Now</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Your Application Journey
                </CardTitle>
                <CardDescription>
                  Track your progress towards studying in the UAE
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-gray-600">{Math.round(getApplicationProgress())}%</span>
                    </div>
                    <Progress value={getApplicationProgress()} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Application Timeline</h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Profile Created</p>
                            <p className="text-xs text-gray-500">Account setup complete</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${applications.length > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <BookOpen className={`w-4 h-4 ${applications.length > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">First Application</p>
                            <p className="text-xs text-gray-500">
                              {applications.length > 0 ? 'Application submitted' : 'Ready to apply'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${applications.filter(app => app.status === 'accepted').length > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <GraduationCap className={`w-4 h-4 ${applications.filter(app => app.status === 'accepted').length > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">University Acceptance</p>
                            <p className="text-xs text-gray-500">
                              {applications.filter(app => app.status === 'accepted').length > 0 ? 'Congratulations!' : 'Awaiting results'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Next Steps</h4>
                      <div className="space-y-3">
                        {applications.length === 0 && (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-blue-900">Ready to get started?</p>
                            <p className="text-xs text-blue-700 mt-1">Browse programs and submit your first application</p>
                            <Button size="sm" className="mt-3 bg-secondary hover:bg-yellow-400 text-black" asChild>
                              <Link href="/programs">Browse Programs</Link>
                            </Button>
                          </div>
                        )}
                        
                        {applications.filter(app => app.status === 'pending').length > 0 && (
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-yellow-900">Applications in Review</p>
                            <p className="text-xs text-yellow-700 mt-1">Universities are reviewing your applications</p>
                          </div>
                        )}

                        {applications.filter(app => app.status === 'accepted').length > 0 && (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-green-900">Congratulations!</p>
                            <p className="text-xs text-green-700 mt-1">You have university acceptances. Contact our team for next steps.</p>
                            <Button size="sm" className="mt-3" variant="outline">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Contact Support
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}