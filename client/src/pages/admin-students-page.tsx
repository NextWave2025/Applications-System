import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, GraduationCap, FileText, CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { format } from "date-fns";

interface Application {
  id: number;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  status: string;
  submissionDate: string;
  lastUpdated: string;
  program: {
    name: string;
    degreeLevel: string;
    university: {
      name: string;
      city: string;
    };
  };
}

export default function AdminStudentsPage() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [degreeFilter, setDegreeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "super_admin") {
      navigate("/");
    }
  }, [user, navigate]);

  const { data: applications = [], isLoading: loading, error } = useQuery<Application[]>({
    queryKey: ["/api/admin/applications"],
    enabled: !!user && (user.role === "admin" || user.role === "super_admin"),
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    throwOnError: false,
    queryFn: async () => {
      const response = await fetch("/api/admin/applications", { credentials: "include" });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  if (!user) {
    navigate("/auth");
    return null;
  }

  const filteredApplications = applications.filter(app => {
    if (statusFilter !== "all" && app.status !== statusFilter) return false;
    if (degreeFilter !== "all" && app.program?.degreeLevel !== degreeFilter) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const studentName = `${app.studentFirstName} ${app.studentLastName}`.toLowerCase();
      return (
        studentName.includes(query) ||
        app.studentEmail.toLowerCase().includes(query) ||
        app.program?.name.toLowerCase().includes(query) ||
        app.program?.university?.name.toLowerCase().includes(query)
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
      case "status":
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  // Group applications by student
  const studentApplications = applications.reduce((acc, app) => {
    const key = app.studentEmail;
    if (!acc[key]) {
      acc[key] = {
        studentFirstName: app.studentFirstName,
        studentLastName: app.studentLastName,
        studentEmail: app.studentEmail,
        applications: []
      };
    }
    acc[key].applications.push(app);
    return acc;
  }, {} as Record<string, any>);

  const uniqueStudents = Object.values(studentApplications);
  const degreeLevels = Array.from(new Set(applications.map(app => app.program?.degreeLevel).filter(Boolean))).sort();

  const stats = {
    totalStudents: uniqueStudents.length,
    totalApplications: applications.length,
    approved: applications.filter(app => app.status === "approved").length,
    pending: applications.filter(app => app.status === "submitted" || app.status === "under-review").length,
    rejected: applications.filter(app => app.status === "rejected").length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "submitted":
      case "under-review":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "submitted":
      case "under-review":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Students Management</h1>
          <p className="text-gray-600 mt-2">View and manage student applications</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">Failed to load student data. Please try refreshing the page.</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
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
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
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
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search students by name, email, program, or university..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
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
              {degreeLevels.map(level => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
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
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Applications ({sortedApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : sortedApplications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {applications.length === 0 ? "No applications found" : "No applications match your filters"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedApplications.map((application) => (
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
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(application.status)}
                          <Badge className={`ml-2 ${getStatusColor(application.status)}`}>
                            {application.status.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.submissionDate ? format(parseDate(application.submissionDate), "MMM d, yyyy") : "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/applications/${application.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}