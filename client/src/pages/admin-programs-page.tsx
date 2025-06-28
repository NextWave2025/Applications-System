import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Search, BookOpen, DollarSign, Edit, Trash2, RefreshCw, Power, PowerOff } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
interface Program {
  id: number;
  name: string;
  degreeLevel: string;
  fieldOfStudy: string;
  duration: string;
  intake: string;
  tuitionFee?: number;
  description?: string;
  active?: boolean;
  university?: {
    id: number;
    name: string;
    logoUrl?: string;
  };
}

interface University {
  id: number;
  name: string;
  city: string;
  logoUrl?: string;
}

export default function AdminProgramsPage() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [degreeFilter, setDegreeFilter] = useState("all");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [universityFilter, setUniversityFilter] = useState("all");
  const [selectedPrograms, setSelectedPrograms] = useState<number[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    degreeLevel: "",
    fieldOfStudy: "",
    duration: "",
    intake: "",
    tuitionFee: 0,
    description: "",
    universityId: 0
  });

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "super_admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch programs with comprehensive error handling
  const { data: programs = [], isLoading: loading, error } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
    enabled: !!user && (user.role === "admin" || user.role === "super_admin"),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    throwOnError: false,
  });

  // Fetch universities for dropdowns
  const { data: universitiesList = [] } = useQuery<University[]>({
    queryKey: ["/api/universities"],
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
      await queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      await queryClient.refetchQueries({ queryKey: ["/api/programs"] });
      toast({ title: "Data refreshed successfully" });
    } catch (error) {
      toast({ title: "Failed to refresh data", variant: "destructive" });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Add program with enhanced error handling
  const handleAddProgram = async () => {
    try {
      const response = await apiRequest("POST", "/api/admin/programs", formData);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add program: ${errorText}`);
      }
      toast({ title: "Program added successfully" });
      setAddDialogOpen(false);
      setFormData({ name: "", degreeLevel: "", fieldOfStudy: "", duration: "", intake: "", tuitionFee: 0, description: "", universityId: 0 });
      await refreshData();
    } catch (error) {
      console.error("Add program error:", error);
      toast({ title: "Failed to add program", variant: "destructive" });
    }
  };

  // Edit program with enhanced error handling
  const handleEditProgram = async () => {
    if (!selectedProgram) return;
    try {
      const response = await apiRequest("PUT", `/api/admin/programs/${selectedProgram.id}`, formData);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update program: ${errorText}`);
      }
      toast({ title: "Program updated successfully" });
      setEditDialogOpen(false);
      setSelectedProgram(null);
      await refreshData();
    } catch (error) {
      console.error("Edit program error:", error);
      toast({ title: "Failed to update program", variant: "destructive" });
    }
  };

  // Delete program with enhanced error handling
  const handleDeleteProgram = async () => {
    if (!selectedProgram) return;
    try {
      const response = await apiRequest("DELETE", `/api/admin/programs/${selectedProgram.id}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete program: ${errorText}`);
      }
      toast({ title: "Program deleted successfully" });
      setDeleteDialogOpen(false);
      setSelectedProgram(null);
      await refreshData();
    } catch (error) {
      console.error("Delete program error:", error);
      toast({ title: "Failed to delete program", variant: "destructive" });
    }
  };

  // Toggle program status
  const toggleProgramStatus = async (program: Program) => {
    try {
      await apiRequest("PATCH", `/api/admin/programs/${program.id}/toggle-status`);
      toast({ title: `Program ${program.active ? 'deactivated' : 'activated'} successfully` });
      refreshData();
    } catch (error) {
      toast({ title: "Failed to update program status", variant: "destructive" });
    }
  };

  // Batch operations
  const handleBatchDelete = async () => {
    if (selectedPrograms.length === 0) return;
    try {
      await apiRequest("DELETE", "/api/admin/programs/batch", {
        body: JSON.stringify({ ids: selectedPrograms }),
        headers: { "Content-Type": "application/json" }
      });
      toast({ title: `${selectedPrograms.length} programs deleted successfully` });
      setSelectedPrograms([]);
      refreshData();
    } catch (error) {
      toast({ title: "Failed to delete programs", variant: "destructive" });
    }
  };

  const openEditDialog = (program: Program) => {
    setSelectedProgram(program);
    setFormData({
      name: program.name,
      degreeLevel: program.degreeLevel,
      fieldOfStudy: program.fieldOfStudy,
      duration: program.duration,
      intake: program.intake,
      tuitionFee: program.tuitionFee || 0,
      description: program.description || "",
      universityId: program.university?.id || 0
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (program: Program) => {
    setSelectedProgram(program);
    setDeleteDialogOpen(true);
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  // Filter programs  
  const filteredPrograms = programs.filter(program => {
    if (degreeFilter !== "all" && program.degreeLevel !== degreeFilter) return false;
    if (fieldFilter !== "all" && program.fieldOfStudy !== fieldFilter) return false;
    if (universityFilter !== "all" && program.university?.name !== universityFilter) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return program.name.toLowerCase().includes(query) || 
             program.fieldOfStudy.toLowerCase().includes(query) ||
             program.university?.name.toLowerCase().includes(query);
    }
    return true;
  });

  const handleSelectAll = () => {
    if (selectedPrograms.length === filteredPrograms.length) {
      setSelectedPrograms([]);
    } else {
      setSelectedPrograms(filteredPrograms.map(p => p.id));
    }
  };

  const degreeLevels = Array.from(new Set(programs.map(p => p.degreeLevel))).sort();
  const fields = Array.from(new Set(programs.map(p => p.fieldOfStudy))).sort();
  const universityNames = Array.from(new Set(programs.map(p => p.university?.name).filter(Boolean) as string[])).sort();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Programs Management</h1>
          <p className="text-gray-600 mt-2">Manage academic programs and courses</p>
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
            Add Program
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">Failed to load programs. Please try refreshing the page.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search programs by name, field, or university..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
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

          <Select value={fieldFilter} onValueChange={setFieldFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Fields" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fields</SelectItem>
              {fields.map(field => (
                <SelectItem key={field} value={field}>{field}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={universityFilter} onValueChange={setUniversityFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Universities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Universities</SelectItem>
              {universityNames.map(uni => (
                <SelectItem key={uni} value={uni || ""}>{uni}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Batch Operations */}
      {selectedPrograms.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedPrograms.length} programs selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBatchDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPrograms([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Programs ({filteredPrograms.length})</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedPrograms.length === filteredPrograms.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {programs.length === 0 ? "No programs found" : "No programs match your filters"}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPrograms.map((program) => (
                <Card key={program.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg leading-tight mb-2">{program.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{program.university?.name}</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {program.degreeLevel}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {program.fieldOfStudy}
                          </Badge>
                        </div>
                      </div>
                      {program.university?.logoUrl && (
                        <img 
                          src={program.university.logoUrl} 
                          alt={`${program.university.name} logo`}
                          className="w-10 h-10 object-contain rounded"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <div className="font-medium">{program.duration}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Intake:</span>
                          <div className="font-medium">{program.intake}</div>
                        </div>
                      </div>

                      {program.tuitionFee && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-green-600">
                            {formatCurrency(program.tuitionFee)}
                          </span>
                          <span className="text-gray-500">per year</span>
                        </div>
                      )}

                      {program.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {program.description}
                        </p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}