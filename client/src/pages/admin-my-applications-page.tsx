import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, FileText, Search, Filter, RefreshCw, Calendar, 
  AlertTriangle, CheckCircle, Clock, XCircle, Eye
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import StatusChangeDialog from "@/components/status-change-dialog";
import { ErrorBoundary } from "@/components/error-boundary";

interface Application {
  id: number;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  status: string;
  submissionDate: string;
  lastUpdated: string;
  program: {
    id: number;
    name: string;
    degreeLevel: string;
    university: {
      id: number;
      name: string;
      city: string;
    };
  };
  agent?: {
    id: number;
    firstName: string;
    lastName: string;
    agencyName: string;
  };
  statusHistory?: Array<{
    fromStatus: string;
    toStatus: string;
    timestamp: string;
    userId: number;
    notes: string;
  }>;
  documents?: {
    passport: boolean;
    transcript: boolean;
    englishCertificate: boolean;
    recommendationLetters: boolean;
    statementOfPurpose: boolean;
  };
  notes?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "under-review":
      return "bg-yellow-100 text-yellow-800";
    case "submitted":
      return "bg-blue-100 text-blue-800";
    case "draft":
      return "bg-gray-100 text-gray-800";
    case "incomplete":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return <CheckCircle className="h-4 w-4" />;
    case "rejected":
      return <XCircle className="h-4 w-4" />;
    case "under-review":
      return <Clock className="h-4 w-4" />;
    case "submitted":
      return <FileText className="h-4 w-4" />;
    case "incomplete":
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export default function AdminMyApplicationsPage() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  // Application management state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [degreeFilter, setDegreeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Status change dialog state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    // Redirect non-admin users
    if (user && user.role !== "admin" && user.role !== "super_admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch applications
  const { data: applications = [], isLoading: loading, error: applicationsError } = useQuery<Application[]>({
    queryKey: ["/api/admin/applications"],
    enabled: !!user && (user.role === "admin" || user.role === "super_admin"),
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    throwOnError: false,
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/applications", {
          credentials: "include"
        });
        if (!response.ok) {
          console.error(`Failed to fetch applications: ${response.status} ${response.statusText}`);
          return [];
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching applications:", error);
        return [];
      }
    },
  });

  const refreshApplications = async () => {
    try {
      setIsRefreshing(true);
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      await queryClient.refetchQueries({ queryKey: ["/api/admin/applications"] });
    } catch (error) {
      console.error("Error refreshing applications:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  const filteredApplications = applications.filter(app => {
    // Status filter
    if (statusFilter !== "all" && app.status !== statusFilter) {
      return false;
    }

    // Degree level filter
    if (degreeFilter !== "all" && app.program.degreeLevel !== degreeFilter) {
      return false;
    }

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const fullName = `${app.studentFirstName} ${app.studentLastName}`.toLowerCase();
      const email = app.studentEmail.toLowerCase();
      const programName = app.program.name.toLowerCase();
      const universityName = app.program.university.name.toLowerCase();
      const agentName = app.agent ? `${app.agent.firstName} ${app.agent.lastName}`.toLowerCase() : '';
      const agencyName = app.agent ? app.agent.agencyName.toLowerCase() : '';
      
      return (
        fullName.includes(query) ||
        email.includes(query) ||
        programName.includes(query) ||
        universityName.includes(query) ||
        agentName.includes(query) ||
        agencyName.includes(query)
      );
    }

    return true;
  });

  // Helper function to safely parse dates
  const parseDate = (dateString: string | null | undefined) => {
    if (!dateString) return new Date(0);
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date(0) : date;
  };

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return parseDate(b.submissionDate).getTime() - parseDate(a.submissionDate).getTime();
      case "oldest":
        return parseDate(a.submissionDate).getTime() - parseDate(b.submissionDate).getTime();
      case "updated":
        return parseDate(b.lastUpdated).getTime() - parseDate(a.lastUpdated).getTime();
      case "student":
        return `${a.studentFirstName} ${a.studentLastName}`.localeCompare(`${b.studentFirstName} ${b.studentLastName}`);
      case "program":
        return (a.program?.name || '').localeCompare(b.program?.name || '');
      case "agent":
        const aAgent = a.agent ? `${a.agent.firstName} ${a.agent.lastName}` : 'Direct Application';
        const bAgent = b.agent ? `${b.agent.firstName} ${b.agent.lastName}` : 'Direct Application';
        return aAgent.localeCompare(bAgent);
      case "status":
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const handleStatusChange = (application: Application) => {
    setSelectedApplication(application);
    setStatusDialogOpen(true);
  };

  // Calculate statistics
  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === "submitted" || app.status === "under-review").length,
    approved: applications.filter(app => app.status === "approved").length,
    rejected: applications.filter(app => app.status === "rejected").length,
    incomplete: applications.filter(app => app.status === "incomplete" || app.status === "draft").length
  };

  return (
    <ErrorBoundary>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Applications</h1>
            <p className="text-gray-600 mt-2">Manage and track all student applications</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={refreshApplications}
              disabled={loading || isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading || isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => navigate("/admin/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>

        {applicationsError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">Failed to load applications. Please try refreshing the page.</p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incomplete</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.incomplete}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="list" className="space-y-6">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="cards">Card View</TabsTrigger>
          </TabsList>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by student name, email, program, or university..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                </SelectContent>
              </Select>

              <Select value={degreeFilter} onValueChange={setDegreeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Bachelor">Bachelor</SelectItem>
                  <SelectItem value="Master">Master</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="updated">Recently Updated</SelectItem>
                  <SelectItem value="student">Student Name</SelectItem>
                  <SelectItem value="program">Program</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="list" className="space-y-4">
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          <p className="mt-2 text-sm text-gray-500">Loading applications...</p>
                        </td>
                      </tr>
                    ) : sortedApplications.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          {applications.length === 0 ? "No applications found" : "No applications match your filters"}
                        </td>
                      </tr>
                    ) : (
                      sortedApplications.map((application) => (
                        <tr key={application.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {application.studentFirstName} {application.studentLastName}
                              </div>
                              <div className="text-sm text-gray-500">{application.studentEmail}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">{application.program?.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{application.program?.degreeLevel || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">{application.program?.university?.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{application.program?.university?.city || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-4">
                            {application.agent ? (
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {application.agent.firstName} {application.agent.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{application.agent.agencyName}</div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">Direct Application</div>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(application.status)}
                              <Badge className={`ml-2 ${getStatusColor(application.status)}`}>
                                {application.status.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {application.submissionDate ? format(parseDate(application.submissionDate), "MMM d, yyyy") : "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/admin/applications/${application.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(application)}
                              >
                                Change Status
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cards" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <p className="ml-2 text-sm text-gray-500">Loading applications...</p>
                </div>
              ) : sortedApplications.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  {applications.length === 0 ? "No applications found" : "No applications match your filters"}
                </div>
              ) : (
                sortedApplications.map((application) => (
                  <Card key={application.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {application.studentFirstName} {application.studentLastName}
                        </CardTitle>
                        <div className="flex items-center">
                          {getStatusIcon(application.status)}
                          <Badge className={`ml-2 ${getStatusColor(application.status)}`}>
                            {application.status.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{application.program?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">
                            {application.program?.degreeLevel || 'N/A'} • {application.program?.university?.name || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700">Agent</p>
                          {application.agent ? (
                            <p className="text-sm text-gray-500">
                              {application.agent.firstName} {application.agent.lastName} • {application.agent.agencyName}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500">Direct Application</p>
                          )}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          Submitted {application.submissionDate ? format(parseDate(application.submissionDate), "MMM d, yyyy") : "N/A"}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/applications/${application.id}`)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(application)}
                            className="flex-1"
                          >
                            Update Status
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Status Change Dialog */}
        <StatusChangeDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          application={selectedApplication}
          onStatusChanged={refreshApplications}
        />
      </div>
    </ErrorBoundary>
  );
}