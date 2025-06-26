import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Loader2, Users, FileText, AlertTriangle, 
  Clock, School
} from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";

interface AdminStats {
  totalApplications: number;
  pendingReviews: number;
  approvedApplications: number;
  activeAgents: number;
  totalStudents: number;
  totalUniversities: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();

  // Redirect non-admin users
  React.useEffect(() => {
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
      try {
        console.log("Fetching admin stats...");
        const response = await fetch("/api/admin/stats", {
          credentials: "include"
        });
        if (!response.ok) {
          console.error(`Failed to fetch stats: ${response.status} ${response.statusText}`);
          return {
            totalApplications: 0,
            pendingReviews: 0,
            approvedApplications: 0,
            activeAgents: 0,
            totalStudents: 0,
            totalUniversities: 0
          };
        }
        const data = await response.json();
        console.log("Admin stats response:", data);
        return data;
      } catch (error) {
        console.error("Admin stats fetch error:", error);
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

  const loading = loadingStats;
  const error = statsError ? "Failed to load admin dashboard statistics" : null;

  // Redirect to login if not authenticated
  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <Users className="h-4 w-4 text-muted-foreground" />
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
                    <School className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalStudents}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Universities
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

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/admin/my-applications")}>
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-medium">My Applications</h3>
                  <p className="text-sm text-gray-600">Manage applications</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/admin/control")}>
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-medium">Admin Control</h3>
                  <p className="text-sm text-gray-600">System management</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/admin/universities")}>
              <div className="flex items-center space-x-3">
                <School className="h-8 w-8 text-purple-600" />
                <div>
                  <h3 className="font-medium">Universities</h3>
                  <p className="text-sm text-gray-600">Manage institutions</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/admin/programs")}>
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-orange-600" />
                <div>
                  <h3 className="font-medium">Programs</h3>
                  <p className="text-sm text-gray-600">Manage programs</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}