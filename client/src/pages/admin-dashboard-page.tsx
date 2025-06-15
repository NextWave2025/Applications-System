import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, Users, FileText, AlertTriangle, CheckCircle, 
  Clock, School, Search, Calendar, Filter, RefreshCw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import StatusChangeDialog from "@/components/status-change-dialog";
import { UserActionDialog } from "@/components/user-action-dialog";

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

interface Application {
  id: number;
  userId: number;
  programId: number;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentPhone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  program: {
    name: string;
    universityName: string;
    universityLogo: string;
    degree: string;
  };
  documents: {
    id: number;
    documentType: string;
    originalFilename: string;
  }[];
  // New status management fields
  statusHistory?: Array<{
    fromStatus: string;
    toStatus: string;
    timestamp: string;
    userId: number;
    notes: string;
    userDetails?: {
      username: string;
      firstName: string;
      lastName: string;
    };
  }>;
  adminNotes?: string;
  rejectionReason?: string;
  conditionalOfferTerms?: string;
  paymentConfirmation?: boolean;
  submittedToUniversityDate?: string;
  lastActionBy?: number;
}

interface AuditLog {
  id: number;
  userId: number;
  action: string;
  resourceType: string;
  resourceId: number;
  createdAt: string;
  previousData?: any;
  newData?: any;
}

function AuditLogsTable() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<Record<number, User>>({});

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        console.log("Fetching audit logs manually...");
        setLoading(true);
        const response = await apiRequest("GET", "/api/admin/audit-logs");
        const data = await response.json();
        console.log("Manually fetched audit logs:", data);
        setAuditLogs(data);
      } catch (err) {
        console.error("Error fetching audit logs:", err);
        console.error("Error details:", err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/users");
        const data = await response.json();
        // Create a map of user IDs to user objects for easier lookup
        const userMap: Record<number, User> = {};
        data.forEach((user: User) => {
          userMap[user.id] = user;
        });
        setUsers(userMap);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchAuditLogs();
    fetchUsers();
  }, []);

  const getActionLabel = (action: string) => {
    // Convert snake_case to Title Case with spaces
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getResourceTypeLabel = (resourceType: string) => {
    // Convert to Title Case
    return resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
  };

  const getUserName = (userId: number) => {
    const user = users[userId];
    if (!user) return `User #${userId}`;
    return `${user.firstName} ${user.lastName} (${user.username})`;
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search audit logs..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Select
          value={filter}
          onValueChange={(value) => setFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="application">Application</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => {
            setFilter("all");
            setSearchQuery("");
          }}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-3 px-4 text-left">Date/Time</th>
                <th className="py-3 px-4 text-left">User</th>
                <th className="py-3 px-4 text-left">Action</th>
                <th className="py-3 px-4 text-left">Resource Type</th>
                <th className="py-3 px-4 text-left">Resource ID</th>
                <th className="py-3 px-4 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="border-b">
                    <td className="py-3 px-4">
                      {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                    </td>
                    <td className="py-3 px-4">
                      {getUserName(log.userId)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="bg-blue-50 text-blue-800">
                        {getActionLabel(log.action)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {getResourceTypeLabel(log.resourceType)}
                    </td>
                    <td className="py-3 px-4">
                      {log.resourceId}
                    </td>
                    <td className="py-3 px-4">
                      {log.previousData && log.newData && (
                        <Button variant="ghost" size="sm">
                          View Changes
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ApplicationsManagementTable() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Status change dialog state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        console.log("Fetching applications manually...");
        setLoading(true);
        const response = await apiRequest("GET", "/api/admin/applications");
        const data = await response.json();
        console.log("Manually fetched applications:", data);
        setApplications(data);
      } catch (err) {
        console.error("Error fetching applications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const filteredApplications = applications.filter(app => {
    // Status filter
    if (statusFilter !== "all" && app.status !== statusFilter) {
      return false;
    }
    
    // Search query filter (student name or email)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const fullName = `${app.studentFirstName} ${app.studentLastName}`.toLowerCase();
      const email = app.studentEmail.toLowerCase();
      const programName = app.program.name.toLowerCase();
      
      return fullName.includes(query) || 
             email.includes(query) || 
             programName.includes(query);
    }
    
    return true;
  });

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "under-review":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "incomplete":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const openChangeStatusDialog = (application: Application) => {
    setSelectedApplication(application);
    setStatusDialogOpen(true);
  };
  
  const refreshApplications = async () => {
    try {
      const response = await apiRequest("GET", "/api/admin/applications");
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      console.error("Error refreshing applications:", err);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name, email, or program..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
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
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => {
            setStatusFilter("all");
            setSearchQuery("");
          }}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Student</th>
                <th className="py-3 px-4 text-left">Program</th>
                <th className="py-3 px-4 text-left">University</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Updated</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-muted-foreground">
                    No applications found
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="border-b">
                    <td className="py-3 px-4">{app.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{app.studentFirstName} {app.studentLastName}</div>
                      <div className="text-xs text-muted-foreground">{app.studentEmail}</div>
                    </td>
                    <td className="py-3 px-4">{app.program.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {app.program.universityLogo && (
                          <div className="h-6 w-6 rounded-full overflow-hidden">
                            <img 
                              src={app.program.universityLogo} 
                              alt={app.program.universityName} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <span>{app.program.universityName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant="outline" 
                        className={getStatusBadgeStyles(app.status)}
                      >
                        {app.status.replace('-', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {format(new Date(app.updatedAt), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openChangeStatusDialog(app)}
                        >
                          Change Status
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setLocation(`/admin/applications/${app.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Status Change Dialog */}
      <StatusChangeDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        application={selectedApplication}
        onStatusChanged={refreshApplications}
      />
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // User action dialog state
  const [userActionDialogOpen, setUserActionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userActionType, setUserActionType] = useState<"activate" | "deactivate">("deactivate");

  useEffect(() => {
    // If the user is not an admin, redirect to the dashboard
    if (user && user.role !== "admin") {
      setLocation("/");
    }
  }, [user, setLocation]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiRequest("GET", "/api/admin/stats");
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setError("Failed to load admin dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "admin") {
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await apiRequest("GET", "/api/admin/users");
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (user && user.role === "admin") {
      fetchUsers();
    }
  }, [user]);

  // Redirect to login if not authenticated
  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => setLocation("/")}>Back to Main Dashboard</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {loading ? (
          <Card className="col-span-3 h-48 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </Card>
        ) : error ? (
          <Card className="col-span-3 h-48 flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-2" />
              <p className="text-destructive">{error}</p>
            </div>
          </Card>
        ) : (
          stats && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Applications
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalApplications}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Reviews
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingReviews}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Approved Applications
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.approvedApplications}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Agents
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeAgents}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Students
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Universities
                  </CardTitle>
                  <School className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUniversities}</div>
                </CardContent>
              </Card>
            </>
          )
        )}
      </div>

      <Separator className="my-6" />

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="flex justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left">Username</th>
                        <th className="py-3 px-4 text-left">Name</th>
                        <th className="py-3 px-4 text-left">Agency</th>
                        <th className="py-3 px-4 text-left">Role</th>
                        <th className="py-3 px-4 text-left">Status</th>
                        <th className="py-3 px-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b">
                          <td className="py-3 px-4">{user.username}</td>
                          <td className="py-3 px-4">{user.firstName} {user.lastName}</td>
                          <td className="py-3 px-4">{user.agencyName || '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              user.role === 'admin' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              user.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {user.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={user.role === 'admin'}
                                onClick={() => {
                                  setSelectedUser(user);
                                  setUserActionType(user.active ? "deactivate" : "activate");
                                  setUserActionDialogOpen(true);
                                }}
                              >
                                {user.active ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                              >
                                View
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
        </TabsContent>
        <TabsContent value="applications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ApplicationsManagementTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="audit-logs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <AuditLogsTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* User Action Confirmation Dialog */}
      <UserActionDialog
        open={userActionDialogOpen}
        onOpenChange={setUserActionDialogOpen}
        onConfirm={async () => {
          if (!selectedUser) return;
          
          try {
            // Set the user status to the opposite of current status
            await apiRequest("PATCH", `/api/admin/users/${selectedUser.id}/status`, {
              active: userActionType === "activate" // true if activating, false if deactivating
            });
            
            // Refresh the user list
            const response = await apiRequest("GET", "/api/admin/users");
            const data = await response.json();
            setUsers(data);
          } catch (err) {
            console.error(`Error ${userActionType === "activate" ? "activating" : "deactivating"} user:`, err);
          }
        }}
        title={userActionType === "activate" ? "Activate User Account" : "Deactivate User Account"}
        description={
          userActionType === "activate"
            ? `Are you sure you want to activate the account for ${selectedUser?.firstName} ${selectedUser?.lastName}? This will allow the user to log in to the system.`
            : `Are you sure you want to deactivate the account for ${selectedUser?.firstName} ${selectedUser?.lastName}? This user will no longer be able to log in to the system.`
        }
        actionLabel={userActionType === "activate" ? "Activate" : "Deactivate"}
        actionVariant={userActionType === "activate" ? "default" : "destructive"}
      />
    </div>
  );
}