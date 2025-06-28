import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search, MapPin, Globe, Edit, Trash2, RefreshCw, Power, PowerOff, BookOpen, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
interface University {
  id: number;
  name: string;
  city: string;
  website?: string;
  logoUrl?: string;
  type?: string;
  ranking?: number;
  active?: boolean;
}

export default function AdminUniversitiesPage() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedUniversities, setSelectedUniversities] = useState<number[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  
  // Comprehensive form states
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    website: "",
    logoUrl: "",
    type: "",
    ranking: 0,
    description: "",
    establishedYear: "",
    accreditation: "",
    campusSize: "",
    studentCapacity: 0,
    internationalStudents: 0,
    facultyCount: 0,
    researchRating: "",
    facilities: "",
    admissionRequirements: "",
    applicationDeadline: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    programs: [] as any[]
  });

  // Program management states
  const [programsTab, setProgramsTab] = useState(false);
  const [universityPrograms, setUniversityPrograms] = useState<any[]>([]);
  const [newProgram, setNewProgram] = useState({
    name: "",
    degreeLevel: "",
    fieldOfStudy: "",
    duration: "",
    intake: "",
    tuitionFee: 0,
    description: ""
  });
  const [editingProgramIndex, setEditingProgramIndex] = useState<number | null>(null);

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "super_admin") {
      navigate("/");
    }
  }, [user, navigate]);

  const { data: universities = [], isLoading: loading, error } = useQuery<University[]>({
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
        console.error("Universities fetch error:", error);
        return [];
      }
    },
  });

  // Refresh data function
  const refreshData = async () => {
    try {
      setIsRefreshing(true);
      await queryClient.invalidateQueries({ queryKey: ["/api/universities"] });
      await queryClient.refetchQueries({ queryKey: ["/api/universities"] });
      toast({ title: "Data refreshed successfully" });
    } catch (error) {
      toast({ title: "Failed to refresh data", variant: "destructive" });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Add university
  const handleAddUniversity = async () => {
    try {
      await apiRequest("POST", "/api/admin/universities", {
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" }
      });
      toast({ title: "University added successfully" });
      setAddDialogOpen(false);
      setFormData({ name: "", city: "", website: "", logoUrl: "", type: "", ranking: 0 });
      refreshData();
    } catch (error) {
      toast({ title: "Failed to add university", variant: "destructive" });
    }
  };

  // Edit university
  const handleEditUniversity = async () => {
    if (!selectedUniversity) return;
    try {
      await apiRequest("PUT", `/api/admin/universities/${selectedUniversity.id}`, {
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" }
      });
      toast({ title: "University updated successfully" });
      setEditDialogOpen(false);
      setSelectedUniversity(null);
      refreshData();
    } catch (error) {
      toast({ title: "Failed to update university", variant: "destructive" });
    }
  };

  // Delete university
  const handleDeleteUniversity = async () => {
    if (!selectedUniversity) return;
    try {
      await apiRequest("DELETE", `/api/admin/universities/${selectedUniversity.id}`);
      toast({ title: "University deleted successfully" });
      setDeleteDialogOpen(false);
      setSelectedUniversity(null);
      refreshData();
    } catch (error) {
      toast({ title: "Failed to delete university", variant: "destructive" });
    }
  };

  // Toggle university status
  const toggleUniversityStatus = async (university: University) => {
    try {
      await apiRequest("PATCH", `/api/admin/universities/${university.id}/toggle-status`);
      toast({ title: `University ${university.active ? 'deactivated' : 'activated'} successfully` });
      refreshData();
    } catch (error) {
      toast({ title: "Failed to update university status", variant: "destructive" });
    }
  };

  // Batch operations
  const handleBatchDelete = async () => {
    if (selectedUniversities.length === 0) return;
    try {
      await apiRequest("DELETE", "/api/admin/universities/batch", {
        body: JSON.stringify({ ids: selectedUniversities }),
        headers: { "Content-Type": "application/json" }
      });
      toast({ title: `${selectedUniversities.length} universities deleted successfully` });
      setSelectedUniversities([]);
      refreshData();
    } catch (error) {
      toast({ title: "Failed to delete universities", variant: "destructive" });
    }
  };

  // Function will be defined after filteredUniversities

  const openEditDialog = (university: University) => {
    setSelectedUniversity(university);
    setFormData({
      name: university.name,
      city: university.city,
      website: university.website || "",
      logoUrl: university.logoUrl || "",
      type: university.type || "",
      ranking: university.ranking || 0
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (university: University) => {
    setSelectedUniversity(university);
    setDeleteDialogOpen(true);
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  // Define filter logic after user check
  const filteredUniversities = universities.filter(university => {
    if (statusFilter === "active" && !university.active) return false;
    if (statusFilter === "inactive" && university.active) return false;
    if (typeFilter !== "all" && university.type !== typeFilter) return false;
    if (cityFilter !== "all" && university.city !== cityFilter) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return university.name.toLowerCase().includes(query) || 
             university.city.toLowerCase().includes(query);
    }
    return true;
  });

  const cities = Array.from(new Set(universities.map(uni => uni.city))).sort();
  const types = Array.from(new Set(universities.map(uni => uni.type).filter(Boolean) as string[])).sort();

  const handleSelectAll = () => {
    if (selectedUniversities.length === filteredUniversities.length) {
      setSelectedUniversities([]);
    } else {
      setSelectedUniversities(filteredUniversities.map(u => u.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Universities Management</h1>
          <p className="text-gray-600 mt-2">Manage partner universities and institutions</p>
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
            Add University
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">Failed to load universities. Please try refreshing the page.</p>
        </div>
      )}

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search universities by name or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Cities</option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Batch Operations */}
      {selectedUniversities.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedUniversities.length} universities selected
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
                  onClick={() => setSelectedUniversities([])}
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
            <CardTitle>Universities ({filteredUniversities.length})</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedUniversities.length === filteredUniversities.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredUniversities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No universities found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUniversities.map((university) => (
                <Card key={university.id} className={`hover:shadow-md transition-shadow ${selectedUniversities.includes(university.id) ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedUniversities.includes(university.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUniversities([...selectedUniversities, university.id]);
                            } else {
                              setSelectedUniversities(selectedUniversities.filter(id => id !== university.id));
                            }
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg leading-tight">{university.name}</h3>
                          <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            {university.city}
                          </div>
                          {university.active === false && (
                            <Badge variant="secondary" className="mt-2 text-xs bg-red-100 text-red-800">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                      {university.logoUrl && (
                        <img 
                          src={university.logoUrl} 
                          alt={`${university.name} logo`}
                          className="w-12 h-12 object-contain rounded"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {university.website && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <a 
                            href={university.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Website
                          </a>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {university.type || 'University'}
                        </Badge>
                        {university.ranking && (
                          <Badge variant="outline" className="text-xs">
                            Rank #{university.ranking}
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => openEditDialog(university)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleUniversityStatus(university)}
                          className={university.active === false ? "text-green-600 hover:text-green-700" : "text-orange-600 hover:text-orange-700"}
                        >
                          {university.active === false ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => openDeleteDialog(university)}
                        >
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

      {/* Add University Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New University</DialogTitle>
            <DialogDescription>Create a new university entry</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">University Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter university name"
              />
            </div>
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Enter city"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://university.edu"
              />
            </div>
            <div>
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="Public, Private, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUniversity} disabled={!formData.name || !formData.city}>
              Add University
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit University Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit University</DialogTitle>
            <DialogDescription>Update university information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">University Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter university name"
              />
            </div>
            <div>
              <Label htmlFor="edit-city">City *</Label>
              <Input
                id="edit-city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Enter city"
              />
            </div>
            <div>
              <Label htmlFor="edit-website">Website</Label>
              <Input
                id="edit-website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://university.edu"
              />
            </div>
            <div>
              <Label htmlFor="edit-logoUrl">Logo URL</Label>
              <Input
                id="edit-logoUrl"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <Label htmlFor="edit-type">Type</Label>
              <Input
                id="edit-type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="Public, Private, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUniversity} disabled={!formData.name || !formData.city}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete University Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete University</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedUniversity?.name}"? This action cannot be undone and will also delete all associated programs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUniversity}>
              Delete University
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}