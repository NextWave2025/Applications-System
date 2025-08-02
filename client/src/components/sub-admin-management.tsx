import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/query-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Shield, ShieldOff, Trash2, RotateCcw, Eye, Copy } from "lucide-react";

const createSubAdminSchema = z.object({
  username: z.string().email("Please enter a valid email"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number")
    .optional(),
});

type CreateSubAdminForm = z.infer<typeof createSubAdminSchema>;

interface SubAdmin {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export default function SubAdminManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedSubAdmin, setSelectedSubAdmin] = useState<SubAdmin | null>(null);
  const [tempPassword, setTempPassword] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateSubAdminForm>({
    resolver: zodResolver(createSubAdminSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      password: "",
    },
  });

  // Fetch sub-admins
  const { data: subAdmins = [], isLoading } = useQuery<SubAdmin[]>({
    queryKey: ["/api/sub-admin/list"],
    retry: false,
    throwOnError: false,
    queryFn: async () => {
      try {
        const response = await fetch("/api/sub-admin/list", { credentials: "include" });
        if (!response.ok) {
          return [];
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching sub-admins:", error);
        return [];
      }
    },
  });

  // Create sub-admin mutation
  const createSubAdminMutation = useMutation({
    mutationFn: async (data: CreateSubAdminForm) => {
      const response = await apiRequest("POST", "/api/sub-admin/create", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sub-admin/list"] });
      setTempPassword(data.tempPassword);
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Sub-admin created successfully",
        description: `${data.subAdmin.firstName} ${data.subAdmin.lastName} has been added to the system.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating sub-admin",
        description: error.message || "Failed to create sub-admin",
        variant: "destructive",
      });
    },
  });

  // Deactivate sub-admin mutation
  const deactivateSubAdminMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/sub-admin/${id}/deactivate`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sub-admin/list"] });
      toast({
        title: "Sub-admin deactivated",
        description: "The sub-admin account has been deactivated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deactivating sub-admin",
        description: error.message || "Failed to deactivate sub-admin",
        variant: "destructive",
      });
    },
  });

  // Activate sub-admin mutation
  const activateSubAdminMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/sub-admin/${id}/activate`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sub-admin/list"] });
      toast({
        title: "Sub-admin activated",
        description: "The sub-admin account has been activated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error activating sub-admin",
        description: error.message || "Failed to activate sub-admin",
        variant: "destructive",
      });
    },
  });

  // Delete sub-admin mutation
  const deleteSubAdminMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/sub-admin/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sub-admin/list"] });
      toast({
        title: "Sub-admin deleted",
        description: "The sub-admin account has been permanently deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting sub-admin",
        description: error.message || "Failed to delete sub-admin",
        variant: "destructive",
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/sub-admin/${id}/reset-password`);
      return response.json();
    },
    onSuccess: (data) => {
      setTempPassword(data.newPassword);
      toast({
        title: "Password reset successfully",
        description: "A new password has been generated and sent to the sub-admin.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error resetting password",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateSubAdminForm) => {
    createSubAdminMutation.mutate(data);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Password has been copied to your clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Sub-Admin Management</h2>
          <p className="text-gray-600">Create and manage sub-administrator accounts</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <UserPlus className="w-4 h-4 mr-2" />
              Create Sub-Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Sub-Admin</DialogTitle>
              <DialogDescription>
                Create a new sub-administrator account. They will receive login credentials via email.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password (Optional)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Leave blank to auto-generate" {...field} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-gray-600">
                        If left blank, a secure password will be generated automatically.
                      </p>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createSubAdminMutation.isPending}>
                    {createSubAdminMutation.isPending ? "Creating..." : "Create Sub-Admin"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Temporary Password Display */}
      {tempPassword && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>Temporary Password:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{tempPassword}</code>
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(tempPassword)}
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Sub-Admins List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">Loading sub-admins...</div>
        ) : subAdmins.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Sub-Admins</h3>
              <p className="text-gray-600 mb-4">
                You haven't created any sub-administrator accounts yet.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Create First Sub-Admin
              </Button>
            </CardContent>
          </Card>
        ) : (
          subAdmins.map((subAdmin: SubAdmin) => (
            <Card key={subAdmin.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {subAdmin.firstName} {subAdmin.lastName}
                    </CardTitle>
                    <CardDescription>{subAdmin.username}</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={subAdmin.active ? "default" : "secondary"}>
                      {subAdmin.active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">Sub-Admin</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="text-sm text-gray-600">
                    Created: {new Date(subAdmin.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {subAdmin.active ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deactivateSubAdminMutation.mutate(subAdmin.id)}
                        disabled={deactivateSubAdminMutation.isPending}
                        className="w-full sm:w-auto"
                      >
                        <ShieldOff className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Deactivate</span>
                        <span className="sm:hidden">Deactivate</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => activateSubAdminMutation.mutate(subAdmin.id)}
                        disabled={activateSubAdminMutation.isPending}
                        className="w-full sm:w-auto"
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Activate</span>
                        <span className="sm:hidden">Activate</span>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resetPasswordMutation.mutate(subAdmin.id)}
                      disabled={resetPasswordMutation.isPending}
                      className="w-full sm:w-auto"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      <span className="hidden lg:inline">Reset Password</span>
                      <span className="lg:hidden">Reset</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteSubAdminMutation.mutate(subAdmin.id)}
                      disabled={deleteSubAdminMutation.isPending}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Delete</span>
                      <span className="sm:hidden">Del</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Sub-Admin Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Sub-Admin Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-700 mb-2">✅ Can Access:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• View and manage student applications</li>
                <li>• Update application statuses</li>
                <li>• View user account details</li>
                <li>• Access analytics and reports</li>
                <li>• Manage universities and programs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-700 mb-2">❌ Cannot Access:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Create new sub-admins</li>
                <li>• Delete super admin accounts</li>
                <li>• Access billing or payment settings</li>
                <li>• Modify system-wide configurations</li>
                <li>• Access server logs or diagnostics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}