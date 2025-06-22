import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Download,
  FileText,
  User,
  GraduationCap,
  Building,
  Calendar,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Archive,
  Trash2,
} from "lucide-react";
import { apiRequest } from "@/lib/query-client";

type ApplicationData = {
  id: number;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentPhone: string;
  studentDateOfBirth: string;
  studentNationality: string;
  studentGender: string;
  highestQualification: string;
  qualificationName: string;
  institutionName: string;
  graduationYear: string;
  cgpa?: string;
  intakeDate: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  program?: {
    name: string;
    universityName: string;
    degree: string;
    universityLogo?: string;
  };
  documents?: Array<{
    id: number;
    originalFilename: string;
    documentType: string;
    mimeType: string;
  }>;
};

export default function UserApplicationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [downloadingDocs, setDownloadingDocs] = useState(false);
  const queryClient = useQueryClient();

  // Fetch application details
  const { data: application, isLoading, error } = useQuery<ApplicationData>({
    queryKey: [`/api/applications/${id}`],
    enabled: !!id,
  });

  // Archive application mutation
  const archiveApplication = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/applications/${id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to archive");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Application Archived",
        description: "The application has been successfully archived.",
      });
    },
    onError: () => {
      toast({
        title: "Archive Failed",
        description: "Could not archive the application. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete application mutation
  const deleteApplication = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to delete");
      return response.status === 204 ? {} : response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Application Deleted",
        description: "The application has been permanently deleted.",
      });
      setLocation("/dashboard/applications");
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Could not delete the application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "under-review":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "incomplete":
        return <AlertTriangle className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "under-review":
        return "bg-yellow-100 text-yellow-800";
      case "incomplete":
        return "bg-blue-100 text-blue-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDownloadDocument = async (documentId: number, filename: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `${filename} is being downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkDownload = async () => {
    if (!application) return;
    
    setDownloadingDocs(true);
    try {
      const response = await fetch(`/api/admin/applications/${application.id}/documents/bulk`);
      if (!response.ok) throw new Error("Bulk download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${application.studentFirstName}_${application.studentLastName}_documents.zip`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "All documents are being downloaded as ZIP file.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingDocs(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading application details...</div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h1>
        <p className="text-gray-600 mb-6">The application you're looking for doesn't exist or you don't have access to it.</p>
        <Button onClick={() => setLocation("/dashboard/applications")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Button 
            variant="outline" 
            onClick={() => setLocation("/dashboard/applications")}
            className="w-fit"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back to Applications</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Application Details</h1>
            <p className="text-sm sm:text-base text-gray-600">ID: {application.id}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Button
            onClick={() => setLocation(`/dashboard/applications/${application?.id}/edit`)}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Edit className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Edit Application</span>
            <span className="sm:hidden">Edit</span>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Archive Application</AlertDialogTitle>
                <AlertDialogDescription>
                  This will archive the application. You can still view it later but it won't appear in active applications.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => archiveApplication.mutate()}>
                  Archive
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Application</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the application and all associated documents.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => deleteApplication.mutate()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              <CardTitle className="text-base sm:text-lg">Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-sm sm:text-base text-gray-900 break-words">{application.studentFirstName} {application.studentLastName}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Email</label>
                  <div className="flex items-center">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <p className="text-sm sm:text-base text-gray-900 break-all">{application.studentEmail}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Phone</label>
                  <div className="flex items-center">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <p className="text-sm sm:text-base text-gray-900">{application.studentPhone}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Date of Birth</label>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <p className="text-sm sm:text-base text-gray-900">{new Date(application.studentDateOfBirth).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Nationality</label>
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <p className="text-sm sm:text-base text-gray-900">{application.studentNationality}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Gender</label>
                  <p className="text-sm sm:text-base text-gray-900 capitalize">{application.studentGender}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Program Information */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <GraduationCap className="h-5 w-5 text-green-600 mr-2" />
              <CardTitle className="text-base sm:text-lg">Program Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Program</label>
                  <p className="text-sm sm:text-base text-gray-900 font-medium break-words">{application.program?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">University</label>
                  <div className="flex items-center">
                    <Building className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <p className="text-sm sm:text-base text-gray-900 break-words">{application.program?.universityName || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Degree Level</label>
                  <p className="text-sm sm:text-base text-gray-900">{application.program?.degree || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Intake</label>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <p className="text-sm sm:text-base text-gray-900">{application.intakeDate}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Background */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Academic Background</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Highest Qualification</label>
                  <p className="text-sm sm:text-base text-gray-900 break-words">{application.highestQualification}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Name of Degree</label>
                  <p className="text-sm sm:text-base text-gray-900 break-words">{application.qualificationName}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Institution Name</label>
                  <p className="text-sm sm:text-base text-gray-900 break-words">{application.institutionName}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Graduation Year</label>
                  <p className="text-sm sm:text-base text-gray-900">{application.graduationYear}</p>
                </div>
                {application.cgpa && (
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">CGPA/Grade</label>
                    <p className="text-sm sm:text-base text-gray-900">{application.cgpa}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 mr-2" />
                <span className="text-sm sm:text-lg">Uploaded Documents ({application.documents?.length || 0})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.documents && application.documents.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {application.documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3 sm:gap-0"
                    >
                      <div className="flex items-center min-w-0">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{doc.originalFilename}</p>
                          <p className="text-xs sm:text-sm text-gray-500 capitalize">{doc.documentType}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc.id, doc.originalFilename)}
                        className="w-full sm:w-auto"
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6 text-sm sm:text-base">No documents uploaded yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(application.status)}
                <Badge className={getStatusColor(application.status)}>
                  {application.status.replace('-', ' ').toUpperCase()}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="space-y-3 text-sm">
                <div>
                  <label className="font-medium text-gray-500">Application Submitted</label>
                  <p className="text-gray-900">{new Date(application.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-500">Last Updated</label>
                  <p className="text-gray-900">{new Date(application.updatedAt).toLocaleDateString()}</p>
                </div>
                {application.notes && (
                  <div>
                    <label className="font-medium text-gray-500">Additional Notes</label>
                    <p className="text-gray-900">{application.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}