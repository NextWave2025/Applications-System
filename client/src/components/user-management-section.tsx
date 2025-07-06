import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search, Edit, Trash2, RefreshCw, Eye, EyeOff, UserPlus, Mail, Phone, Building, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  agencyName: string;
  phoneNumber?: string;
  active: boolean;
  createdAt: string;
}

interface UserManagementSectionProps {
  users: User[];
  loading: boolean;
  onRefresh?: () => void;
}

export default function UserManagementSection({ users, loading, onRefresh }: UserManagementSectionProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  
  // Form states
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    password: "",
    role: "",
    agencyName: "",
    phoneNumber: "",
    active: true,
  });
  
  const [showPassword, setShowPassword] = useState(false);

  // Filter users
  const filteredUsers = users.filter(userData => {
    if (roleFilter !== "all" && userData.role !== roleFilter) return false;
    if (statusFilter !== "all" && userData.active.toString() !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const fullName = `${userData.firstName} ${userData.lastName}`.toLowerCase();
      const email = userData.username.toLowerCase();
      const agency = userData.agencyName.toLowerCase();
      return fullName.includes(query) || email.includes(query) || agency.includes(query);
    }
    return true;
  });

  // Form validation
  const validateForm = (isEdit = false) => {
    if (!formData.username.trim() || !/\S+@\S+\.\S+/.test(formData.username)) {
      toast({ title: "Please enter a valid email address", variant: "destructive" });
      return false;
    }
    if (!formData.firstName.trim()) {
      toast({ title: "Please enter a first name", variant: "destructive" });
      return false;
    }
    if (!formData.lastName.trim()) {
      toast({ title: "Please enter a last name", variant: "destructive" });
      return false;
    }
    if (!isEdit && (!formData.password || formData.password.length < 6)) {
      toast({ title: "Password must be at least 6 characters long", variant: "destructive" });
      return false;
    }
    if (!formData.role) {
      toast({ title: "Please select a role", variant: "destructive" });
      return false;
    }
    if (!formData.agencyName.trim()) {
      toast({ title: "Please enter an agency name", variant: "destructive" });
      return false;
    }
    return true;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      username: "",
      firstName: "",
      lastName: "",
      password: "",
      role: "",
      agencyName: "",
      phoneNumber: "",
      active: true,
    });
    setSelectedUser(null);
    setNewPassword("");
  };

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/admin/users", userData);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create user");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "User created successfully" });
      setAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create user", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: any }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${id}`, userData);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update user");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated successfully" });
      setEditDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update user", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${id}`);
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "User deleted successfully" });
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: () => {
      toast({ title: "Failed to delete user", variant: "destructive" });
    },
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async ({ id, password }: { id: number; password: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${id}/password`, { password });
      if (!response.ok) {
        throw new Error("Failed to change password");
      }
    },
    onSuccess: () => {
      toast({ title: "Password changed successfully" });
      setPasswordDialogOpen(false);
      setNewPassword("");
      setSelectedUser(null);
    },
    onError: () => {
      toast({ title: "Failed to change password", variant: "destructive" });
    },
  });

  // Toggle user status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${id}/status`, { active });
      if (!response.ok) {
        throw new Error("Failed to update user status");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User status updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update user status", variant: "destructive" });
    },
  });

  // Event handlers
  const handleAddUser = () => {
    if (!validateForm()) return;
    createUserMutation.mutate(formData);
  };

  const handleEditUser = () => {
    if (!selectedUser || !validateForm(true)) return;
    const { password, ...baseData } = formData;
    const updateData = password ? { ...baseData, password } : baseData;
    updateUserMutation.mutate({ id: selectedUser.id, userData: updateData });
  };

  const openEditDialog = (userData: User) => {
    setSelectedUser(userData);
    setFormData({
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      password: "", // Don't pre-fill password
      role: userData.role,
      agencyName: userData.agencyName,
      phoneNumber: userData.phoneNumber || "",
      active: userData.active,
    });
    setEditDialogOpen(true);
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }),
        queryClient.refetchQueries({ queryKey: ["/api/admin/users"] })
      ]);
      if (onRefresh) onRefresh();
      toast({ title: "Data refreshed successfully" });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({ title: "Failed to refresh data", variant: "destructive" });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
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
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
          
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
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-md border">
        <ScrollArea className="h-[600px] w-full">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Role</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Agency</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Created</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
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
                    <td className="px-3 sm:px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {userData.firstName} {userData.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{userData.username}</div>
                        <div className="sm:hidden mt-1">
                          <Badge variant={userData.role === "admin" ? "default" : "secondary"} className="text-xs">
                            {userData.role}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                      <Badge variant={userData.role === "admin" ? "default" : "secondary"}>
                        {userData.role}
                      </Badge>
                    </td>
                    <td className="px-3 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                      {userData.agencyName || "N/A"}
                    </td>
                    <td className="px-3 sm:px-4 py-4 whitespace-nowrap">
                      <Badge variant={userData.active ? "default" : "destructive"}>
                        {userData.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-3 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(userData.createdAt), "MMM dd, yyyy")}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(userData);
                            setViewDialogOpen(true);
                          }}
                          className="p-1 sm:p-2"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(userData)}
                          className="p-1 sm:p-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(userData);
                            setPasswordDialogOpen(true);
                          }}
                          className="p-1 sm:p-2 hidden sm:flex"
                        >
                          <span className="hidden lg:inline">Password</span>
                          <span className="lg:hidden">Pwd</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatusMutation.mutate({ 
                            id: userData.id, 
                            active: !userData.active 
                          })}
                          disabled={toggleStatusMutation.isPending}
                          className="p-1 sm:p-2"
                        >
                          {userData.active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(userData);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </ScrollArea>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-500">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New User
            </DialogTitle>
            <DialogDescription>
              Create a new user account with the specified details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="username">Email Address</Label>
              <Input
                id="username"
                type="email"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password (min 6 characters)"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="Enter phone number"
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddUser} 
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit User
            </DialogTitle>
            <DialogDescription>
              Update user account information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editUsername">Email Address</Label>
              <Input
                id="editUsername"
                type="email"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editRole">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editPhoneNumber">Phone Number</Label>
                <Input
                  id="editPhoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editAgencyName">Agency Name</Label>
              <Input
                id="editAgencyName"
                value={formData.agencyName}
                onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                placeholder="Enter agency name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditUser} 
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              User Details
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Name</Label>
                  <p className="text-sm">{selectedUser.firstName} {selectedUser.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm">{selectedUser.username}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Role</Label>
                  <Badge variant={selectedUser.role === "admin" ? "default" : "secondary"}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge variant={selectedUser.active ? "default" : "destructive"}>
                    {selectedUser.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Agency</Label>
                <p className="text-sm">{selectedUser.agencyName}</p>
              </div>
              {selectedUser.phoneNumber && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p className="text-sm">{selectedUser.phoneNumber}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium text-gray-500">Created</Label>
                <p className="text-sm">{format(new Date(selectedUser.createdAt), "MMMM dd, yyyy 'at' HH:mm")}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter a new password for {selectedUser?.firstName} {selectedUser?.lastName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedUser && newPassword.length >= 6) {
                  changePasswordMutation.mutate({ id: selectedUser.id, password: newPassword });
                } else {
                  toast({ title: "Password must be at least 6 characters long", variant: "destructive" });
                }
              }}
              disabled={changePasswordMutation.isPending || newPassword.length < 6}
            >
              {changePasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedUser && deleteUserMutation.mutate(selectedUser.id)}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}