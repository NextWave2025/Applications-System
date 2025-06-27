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
import { UserActionDialog } from "@/components/user-action-dialog";
import UniversityFormDialog from "@/components/university-form-dialog";
import ProgramFormDialog from "@/components/program-form-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ExcelUploadDialog from "@/components/excel-upload-dialog";
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
  
  // User action dialog state
  const [userActionDialogOpen, setUserActionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userActionType, setUserActionType] = useState<"activate" | "deactivate">("deactivate");

  // University management state
  const [universityDialogOpen, setUniversityDialogOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [universityDeleteDialogOpen, setUniversityDeleteDialogOpen] = useState(false);

  // Program management state
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [programDeleteDialogOpen, setProgramDeleteDialogOpen] = useState(false);

  // Excel upload state
  const [excelUploadDialogOpen, setExcelUploadDialogOpen] = useState(false);

  useEffect(() => {
    // Redirect non-admin users
    if (user && user.role !== "admin" && user.role !== "super_admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch admin stats
  const { data: stats, isLoading: loadingStats, error: statsError } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && (user.role === "admin" || user.role === "super_admin"),
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    throwOnError: false,
    queryFn: async () => {
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
      return response.json();
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
      const response = await fetch("/api/admin/users", { credentials: "include" });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
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
      const response = await fetch("/api/universities", { credentials: "include" });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
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
      const response = await fetch("/api/programs", { credentials: "include" });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const loading = loadingStats || loadingUsers || loadingUniversities || loadingPrograms;
  const error = statsError ? "Failed to load admin statistics" : 
                usersError ? "Failed to load users data" : null;

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleUserAction = (user: User, action: "activate" | "deactivate") => {
    setSelectedUser(user);
    setUserActionType(action);
    setUserActionDialogOpen(true);
  };

  const handleUserActionComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
  };

  return (
    <ErrorBoundary>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Control Panel</h1>
          <Button onClick={() => navigate("/admin/dashboard")}>Back to Dashboard</Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="universities">Universities</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="data">Data Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Applications submitted to date
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeAgents || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently active education agents
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Universities</CardTitle>
                  <School className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUniversities || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Partner universities in system
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Management</h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
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
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users
                        .filter(user => {
                          if (statusFilter === "active" && !user.active) return false;
                          if (statusFilter === "inactive" && user.active) return false;
                          if (searchQuery) {
                            const query = searchQuery.toLowerCase();
                            return (
                              user.firstName?.toLowerCase().includes(query) ||
                              user.lastName?.toLowerCase().includes(query) ||
                              user.username.toLowerCase().includes(query) ||
                              user.agencyName?.toLowerCase().includes(query)
                            );
                          }
                          return true;
                        })
                        .map((user) => (
                          <tr key={user.id}>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{user.username}</div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.agencyName || "-"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                {user.role}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Badge variant={user.active ? "default" : "destructive"}>
                                {user.active ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {format(new Date(user.createdAt), "MMM d, yyyy")}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => 
                                  handleUserAction(user, user.active ? "deactivate" : "activate")
                                }
                              >
                                {user.active ? "Deactivate" : "Activate"}
                              </Button>
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
              <Button onClick={() => setUniversityDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add University
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
                          onClick={() => {
                            setSelectedUniversity(university);
                            setUniversityDialogOpen(true);
                          }}
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
              )}
            </div>
          </TabsContent>

          <TabsContent value="programs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Programs</h2>
              <Button onClick={() => setProgramDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Program
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingPrograms ? (
                <div className="col-span-full flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                programs.slice(0, 12).map((program) => (
                  <Card key={program.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{program.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p><strong>University:</strong> {program.university.name}</p>
                        <p><strong>Level:</strong> {program.degreeLevel}</p>
                        <p><strong>Duration:</strong> {program.duration}</p>
                        <p><strong>Field:</strong> {program.fieldOfStudy}</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProgram(program);
                            setProgramDialogOpen(true);
                          }}
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
              )}
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Data Management</h2>
              <Button onClick={() => setExcelUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Excel Data
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Import Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload Excel files to import universities and programs in bulk.
                  </p>
                  <Button onClick={() => setExcelUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Excel File
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Export current data for backup or analysis purposes.
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">Export Universities</Button>
                    <Button variant="outline" className="w-full">Export Programs</Button>
                    <Button variant="outline" className="w-full">Export Applications</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* User Action Dialog */}
        <UserActionDialog
          open={userActionDialogOpen}
          onOpenChange={setUserActionDialogOpen}
          user={selectedUser}
          action={userActionType}
          onActionComplete={handleUserActionComplete}
        />

        {/* University Dialog */}
        <UniversityFormDialog
          open={universityDialogOpen}
          onOpenChange={setUniversityDialogOpen}
          university={selectedUniversity}
          onUniversityUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/universities"] });
            setSelectedUniversity(null);
          }}
        />

        {/* Program Dialog */}
        <ProgramFormDialog
          open={programDialogOpen}
          onOpenChange={setProgramDialogOpen}
          program={selectedProgram}
          onProgramUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
            setSelectedProgram(null);
          }}
        />

        {/* Excel Upload Dialog */}
        <ExcelUploadDialog
          open={excelUploadDialogOpen}
          onOpenChange={setExcelUploadDialogOpen}
          onUploadComplete={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/universities"] });
            queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
          }}
        />
      </div>
    </ErrorBoundary>
  );
}