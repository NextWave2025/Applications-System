import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Search, Users, Mail, Phone, Building, Edit, UserCheck, UserX, RefreshCw, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  agencyName?: string;
  role: string;
  active: boolean;
  createdAt: string;
  phone?: string;
  country?: string;
  applicationsCount?: number;
}

// Safe date parsing function
const parseDate = (dateString: string): Date => {
  if (!dateString) return new Date();
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return new Date(); // Return current date if parsing fails
  }
  return date;
};

export default function AdminAgentsPage() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<User | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    agencyName: "",
    phone: "",
    country: "",
    password: ""
  });

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "super_admin") {
      navigate("/");
    }
  }, [user, navigate]);

  const { data: agents = [], isLoading: loading, error } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user && (user.role === "admin" || user.role === "super_admin"),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    throwOnError: false,
  });

  // Refresh data function
  const refreshData = async () => {
    try {
      setIsRefreshing(true);
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      await queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Data refreshed successfully" });
    } catch (error) {
      toast({ title: "Failed to refresh data", variant: "destructive" });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Add agent with enhanced error handling
  const handleAddAgent = async () => {
    try {
      const response = await apiRequest("POST", "/api/admin/users", { ...formData, role: "agent" });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add agent: ${errorText}`);
      }
      toast({ title: "Agent added successfully" });
      setAddDialogOpen(false);
      setFormData({ username: "", firstName: "", lastName: "", agencyName: "", phone: "", country: "", password: "" });
      await refreshData();
    } catch (error) {
      console.error("Add agent error:", error);
      toast({ title: "Failed to add agent", variant: "destructive" });
    }
  };

  // Edit agent with enhanced error handling
  const handleEditAgent = async () => {
    if (!selectedAgent) return;
    try {
      const response = await apiRequest("PUT", `/api/admin/users/${selectedAgent.id}`, formData);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update agent: ${errorText}`);
      }
      toast({ title: "Agent updated successfully" });
      setEditDialogOpen(false);
      setSelectedAgent(null);
      await refreshData();
    } catch (error) {
      console.error("Edit agent error:", error);
      toast({ title: "Failed to update agent", variant: "destructive" });
    }
  };

  // Delete agent with enhanced error handling
  const handleDeleteAgent = async () => {
    if (!selectedAgent) return;
    try {
      const response = await apiRequest("DELETE", `/api/admin/users/${selectedAgent.id}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete agent: ${errorText}`);
      }
      toast({ title: "Agent deleted successfully" });
      setDeleteDialogOpen(false);
      setSelectedAgent(null);
      await refreshData();
    } catch (error) {
      console.error("Delete agent error:", error);
      toast({ title: "Failed to delete agent", variant: "destructive" });
    }
  };

  // Toggle agent status
  const toggleAgentStatus = async (agent: User) => {
    try {
      await apiRequest("PATCH", `/api/admin/users/${agent.id}/toggle-status`);
      toast({ title: `Agent ${agent.active ? 'deactivated' : 'activated'} successfully` });
      refreshData();
    } catch (error) {
      toast({ title: "Failed to update agent status", variant: "destructive" });
    }
  };

  const openEditDialog = (agent: User) => {
    setSelectedAgent(agent);
    setFormData({
      username: agent.username,
      firstName: agent.firstName,
      lastName: agent.lastName,
      agencyName: agent.agencyName || "",
      phone: agent.phone || "",
      country: agent.country || "",
      password: ""
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (agent: User) => {
    setSelectedAgent(agent);
    setDeleteDialogOpen(true);
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  const filteredAgents = agents.filter(agent => {
    if (statusFilter === "active" && !agent.active) return false;
    if (statusFilter === "inactive" && agent.active) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        agent.firstName?.toLowerCase().includes(query) ||
        agent.lastName?.toLowerCase().includes(query) ||
        agent.username.toLowerCase().includes(query) ||
        agent.agencyName?.toLowerCase().includes(query)
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

  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return parseDate(b.createdAt).getTime() - parseDate(a.createdAt).getTime();
      case "oldest":
        return parseDate(a.createdAt).getTime() - parseDate(b.createdAt).getTime();
      case "name":
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      case "agency":
        return (a.agencyName || "").localeCompare(b.agencyName || "");
      default:
        return 0;
    }
  });

  const stats = {
    total: agents.length,
    active: agents.filter(a => a.active).length,
    inactive: agents.filter(a => !a.active).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Agents Management</h1>
          <p className="text-gray-600 mt-2">Manage education agents and consultants</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={loading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading || isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">Failed to load agents. Please try refreshing the page.</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Agents</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search agents by name, email, or agency..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="agency">Agency</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agents ({sortedAgents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : sortedAgents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {agents.length === 0 ? "No agents found" : "No agents match your filters"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedAgents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {agent.firstName} {agent.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{agent.username}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{agent.agencyName || "-"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            {agent.username}
                          </div>
                          {agent.phone && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              {agent.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {agent.applicationsCount || 0}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">applications</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge variant={agent.active ? "default" : "destructive"}>
                          {agent.active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {agent.createdAt ? format(parseDate(agent.createdAt), "MMM d, yyyy") : "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(agent)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={agent.active ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                            onClick={() => toggleAgentStatus(agent)}
                          >
                            {agent.active ? <UserX className="h-4 w-4 mr-1" /> : <UserCheck className="h-4 w-4 mr-1" />}
                            {agent.active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openDeleteDialog(agent)}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
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

      {/* Add Agent Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Agent</DialogTitle>
            <DialogDescription>
              Create a new agent account with login credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password (min 6 characters)"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="First name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="agencyName">Agency Name</Label>
              <Input
                id="agencyName"
                value={formData.agencyName}
                onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                placeholder="Enter agency name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Country"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAgent}>Add Agent</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
            <DialogDescription>
              Update agent information and details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="First name"
                />
              </div>
              <div>
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-agencyName">Agency Name</Label>
              <Input
                id="edit-agencyName"
                value={formData.agencyName}
                onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                placeholder="Enter agency name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label htmlFor="edit-country">Country</Label>
                <Input
                  id="edit-country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Country"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAgent}>Update Agent</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Agent Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Agent</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this agent? This action cannot be undone.
              All applications associated with this agent will remain in the system.
            </DialogDescription>
          </DialogHeader>
          {selectedAgent && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="font-medium">{selectedAgent.firstName} {selectedAgent.lastName}</p>
              <p className="text-sm text-gray-600">{selectedAgent.username}</p>
              {selectedAgent.agencyName && (
                <p className="text-sm text-gray-600">{selectedAgent.agencyName}</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAgent}>
              Delete Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}