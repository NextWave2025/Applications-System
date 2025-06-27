import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, Users, FileText, AlertTriangle, CheckCircle, 
  Clock, School, Search, Calendar, Filter, RefreshCw, Plus, Edit, Trash2, Upload
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ErrorBoundary } from "@/components/error-boundary";

interface AdminStats {
  totalApplications: number;
  pendingReviews: number;
  approvedApplications: number;
  activeAgents: number;
  totalStudents: number;
  totalUniversities: number;
}

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  agencyName: string;
  role: string;
  active: boolean;
  createdAt: string;
}

interface University {
  id: number;
  name: string;
  city: string;
  country: string;
  logoUrl?: string;
  website?: string;
  establishedYear?: number;
  ranking?: number;
}

interface Program {
  id: number;
  name: string;
  degreeLevel: string;
  duration: string;
  tuitionFee: number;
  language: string;
  fieldOfStudy: string;
  university: University;
}

export default function AdminControlPage() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  // User management state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Dialog states
  const [universityDeleteDialogOpen, setUniversityDeleteDialogOpen] = useState(false);
  const [programDeleteDialogOpen, setProgramDeleteDialogOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  useEffect(() => {
    // Redirect non-admin users
    if (user && user.role !== "admin" && user.role !== "super_admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Helper function to safely parse dates
  const parseDate = (dateString: string | null | undefined) => {
    if (!dateString) return new Date(0);
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date(0) : date;
  };

  // Fetch admin stats
  const { data: stats, isLoading: loadingStats, error: statsError } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && (user.role === "admin" || user.role === "super_admin"),
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    throwOnError: false,
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/stats", { credentials: "include" });
        if (!response.ok) {
          return {
            totalApplications: 0,
            pendingReviews: 0,
            approvedApplications: 0,
            activeAgents: 0,
            totalStudents: 0,
            totalUniversities: 0
          };
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching admin stats:", error);
        return {
          totalApplications: 0,
          pendingReviews: 0,
          approvedApplications: 0,
          activeAgents: 0,
          totalStudents: 0,
          totalUniversities: 0
        };
      }
    },
  });

  // Fetch users
  const { data: users = [], isLoading: loadingUsers, error: usersError } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user && (user.role === "admin" || user.role === "super_admin"),
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    throwOnError: false,
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/users", { credentials: "include" });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching users:", error);
        return [];
      }
    },
  });

  // Fetch universities
  const { data: universities = [], isLoading: loadingUniversities } = useQuery<University[]>({
    queryKey: ["/api/universities"],
    enabled: !!user && (user.role === "admin" || user.role === "super_admin"),
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    throwOnError: false,
    queryFn: async () => {
      try {
        const response = await fetch("/api/universities", { credentials: "include" });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching universities:", error);
        return [];
      }
    },
  });

  // Fetch programs
  const { data: programs = [], isLoading: loadingPrograms } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
    enabled: !!user && (user.role === "admin" || user.role === "super_admin"),
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    throwOnError: false,
    queryFn: async () => {
      try {
        const response = await fetch("/api/programs", { credentials: "include" });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching programs:", error);
        return [];
      }
    },
  });

  const loading = loadingStats || loadingUsers || loadingUniversities || loadingPrograms;

  if (!user) {
    navigate("/auth");
    return null;
  }

  const filteredUsers = users.filter(userData => {
    if (statusFilter !== "all" && userData.active.toString() !== statusFilter) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const fullName = `${userData.firstName} ${userData.lastName}`.toLowerCase();
      const email = userData.username.toLowerCase();
      const agency = userData.agencyName.toLowerCase();
      
      return fullName.includes(query) || email.includes(query) || agency.includes(query);
    }
    return true;
  });

  const handleDeleteUniversity = async () => {
    if (!selectedUniversity) return;
    
    try {
      await apiRequest(`/api/universities/${selectedUniversity.id}`, {
        method: "DELETE",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/universities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setUniversityDeleteDialogOpen(false);
      setSelectedUniversity(null);
    } catch (error) {
      console.error("Error deleting university:", error);
    }
  };

  const handleDeleteProgram = async () => {
    if (!selectedProgram) return;
    
    try {
      await apiRequest(`/api/programs/${selectedProgram.id}`, {
        method: "DELETE",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setProgramDeleteDialogOpen(false);
      setSelectedProgram(null);
    } catch (error) {
      console.error("Error deleting program:", error);
    }
  };

  return (
    <ErrorBoundary>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Control Panel</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
                queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
                queryClient.invalidateQueries({ queryKey: ["/api/universities"] });
                queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
              }}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => navigate("/admin/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>

        {(statsError || usersError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">Failed to load some data. Please try refreshing the page.</p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats?.pendingReviews || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.approvedApplications || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.activeAgents || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats?.totalStudents || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Universities</CardTitle>
              <School className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.totalUniversities || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="universities">Universities</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="data">Data Management</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, email, or agency..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loadingUsers ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          <p className="mt-2 text-sm text-gray-500">Loading users...</p>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          {users.length === 0 ? "No users found" : "No users match your filters"}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((userData) => (
                        <tr key={userData.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {userData.firstName} {userData.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{userData.username}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Badge variant={userData.role === "admin" ? "default" : "secondary"}>
                              {userData.role}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {userData.agencyName || "N/A"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Badge variant={userData.active ? "default" : "destructive"}>
                              {userData.active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {userData.createdAt ? format(parseDate(userData.createdAt), "MMM d, yyyy") : "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <Button
                                variant={userData.active ? "destructive" : "default"}
                                size="sm"
                                onClick={() => {
                                  // Handle user status toggle
                                  console.log("Toggle user status:", userData.id);
                                }}
                              >
                                {userData.active ? "Deactivate" : "Activate"}
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

          <TabsContent value="universities" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Universities</h2>
              <Button onClick={() => navigate("/admin/universities")}>
                <Plus className="h-4 w-4 mr-2" />
                Manage Universities
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingUniversities ? (
                <div className="col-span-full flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : universities && universities.length > 0 ? (
                universities.map((university) => (
                  <Card key={university.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{university.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        {university.city}, {university.country}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/admin/universities")}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUniversity(university);
                            setUniversityDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex justify-center py-8 text-gray-500">
                  <div className="text-center">
                    <School className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No universities found</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="programs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Programs</h2>
              <Button onClick={() => navigate("/admin/programs")}>
                <Plus className="h-4 w-4 mr-2" />
                Manage Programs
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingPrograms ? (
                <div className="col-span-full flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : programs && programs.length > 0 ? (
                programs.slice(0, 12).map((program) => (
                  <Card key={program.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{program.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p><strong>University:</strong> {program.university?.name || 'N/A'}</p>
                        <p><strong>Level:</strong> {program.degreeLevel}</p>
                        <p><strong>Duration:</strong> {program.duration}</p>
                        <p><strong>Field:</strong> {program.fieldOfStudy}</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/admin/programs")}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProgram(program);
                            setProgramDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex justify-center py-8 text-gray-500">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No programs found</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Data Management</h2>
              <Button onClick={() => console.log("Upload Excel data")}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Excel Data
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Operations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Import or export data in bulk using Excel files.
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      Export Universities
                    </Button>
                    <Button variant="outline" className="w-full">
                      Export Programs
                    </Button>
                    <Button variant="outline" className="w-full">
                      Export Applications
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Universities:</span>
                      <span className="font-medium">{universities.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Programs:</span>
                      <span className="font-medium">{programs.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Users:</span>
                      <span className="font-medium">{users.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Applications:</span>
                      <span className="font-medium">{stats?.totalApplications || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Delete University Dialog */}
        <Dialog open={universityDeleteDialogOpen} onOpenChange={setUniversityDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete University</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedUniversity?.name}"? This action cannot be undone and will also delete all associated programs.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUniversityDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteUniversity}>
                Delete University
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Program Dialog */}
        <Dialog open={programDeleteDialogOpen} onOpenChange={setProgramDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Program</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedProgram?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setProgramDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteProgram}>
                Delete Program
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
}