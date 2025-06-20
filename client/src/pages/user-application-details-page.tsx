import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
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
} from "lucide-react";

export default function UserApplicationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [downloadingDocs, setDownloadingDocs] = useState(false);

  // Fetch application details
  const { data: application, isLoading, error } = useQuery({
    queryKey: [`/api/applications/${id}`],
    enabled: !!id,
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
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
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
        return "bg-orange-100 text-orange-800";
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setLocation("/dashboard/applications")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
            <p className="text-gray-600">ID: {application.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setLocation(`/dashboard/applications/${application.id}/edit`)}
            variant="outline"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Application
          </Button>
          {application.documents && application.documents.length > 0 && (
            <Button
              onClick={handleBulkDownload}
              disabled={downloadingDocs}
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              {downloadingDocs ? "Downloading..." : "Download All Documents"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              <CardTitle className="text-lg">Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900">{application.studentFirstName} {application.studentLastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{application.studentEmail}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{application.studentPhone}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{new Date(application.studentDateOfBirth).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nationality</label>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{application.studentNationality}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Gender</label>
                  <p className="text-gray-900 capitalize">{application.studentGender}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Program Information */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <GraduationCap className="h-5 w-5 text-green-600 mr-2" />
              <CardTitle className="text-lg">Program Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Program</label>
                  <p className="text-gray-900 font-medium">{application.program?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">University</label>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{application.program?.universityName || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Degree Level</label>
                  <p className="text-gray-900">{application.program?.degree || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Intake</label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{application.intakeDate}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Background */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Academic Background</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Highest Qualification</label>
                  <p className="text-gray-900">{application.highestQualification}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Name of Degree</label>
                  <p className="text-gray-900">{application.qualificationName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Institution Name</label>
                  <p className="text-gray-900">{application.institutionName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Graduation Year</label>
                  <p className="text-gray-900">{application.graduationYear}</p>
                </div>
                {application.cgpa && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">CGPA/Grade</label>
                    <p className="text-gray-900">{application.cgpa}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 text-purple-600 mr-2" />
                Uploaded Documents ({application.documents?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.documents && application.documents.length > 0 ? (
                <div className="space-y-3">
                  {application.documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.originalFilename}</p>
                          <p className="text-sm text-gray-500 capitalize">{doc.documentType}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc.id, doc.originalFilename)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No documents uploaded yet</p>
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