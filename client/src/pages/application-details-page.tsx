import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  ArrowLeft,
  Copy,
  Download,
  Trash2,
  Archive,
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
} from "lucide-react";
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

interface Application {
  id: number;
  studentFirstName: string;
  studentLastName: string;
  studentName?: string;
  studentEmail: string;
  studentPhone?: string;
  studentDateOfBirth?: string;
  studentNationality?: string;
  studentGender?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  intakeDate?: string;
  notes?: string;
  highestQualification?: string;
  qualificationName?: string;
  institutionName?: string;
  graduationYear?: string;
  cgpa?: string;
  program?: {
    name: string;
    universityName: string;
    universityLogo: string;
    degree: string;
  };
  agent?: {
    name: string;
    agencyName: string;
    email: string;
  };
  documents?: Array<{
    id: number;
    documentType: string;
    originalFilename: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  }>;
}

export default function ApplicationDetailsPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch application details
  const { data: application, isLoading, error } = useQuery<Application>({
    queryKey: ["/api/admin/applications", id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/applications/${id}`, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch application: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!id,
  });

  // Delete application mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to delete application");
      }
    },
    onSuccess: () => {
      toast({
        title: "Application Deleted",
        description: "The application has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      navigate("/admin");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete application. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Archive application mutation
  const archiveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/applications/${id}/archive`, {
        method: "PATCH",
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to archive application");
      }
    },
    onSuccess: () => {
      toast({
        title: "Application Archived",
        description: "The application has been successfully archived.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications", id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to archive application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "under-review":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "incomplete":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      case "under-review":
        return "secondary";
      case "incomplete":
        return "outline";
      default:
        return "secondary";
    }
  };

  const copyApplicationDetails = () => {
    if (!application) return;

    const studentName = application.studentName || `${application.studentFirstName} ${application.studentLastName}`;
    const details = `
APPLICATION DETAILS
==================

Student Information:
- Name: ${studentName}
- Email: ${application.studentEmail}
- Phone: ${application.studentPhone || "Not provided"}
- Date of Birth: ${application.studentDateOfBirth || "Not provided"}
- Nationality: ${application.studentNationality || "Not provided"}
- Gender: ${application.studentGender || "Not provided"}

Program Information:
- Program: ${application.program?.name || "Not specified"}
- University: ${application.program?.universityName || "Not specified"}
- Degree Level: ${application.program?.degree || "Not specified"}
- Intake: ${application.intakeDate || "Not specified"}

Academic Information:
- Highest Qualification: ${application.highestQualification || "Not provided"}
- Qualification Name: ${application.qualificationName || "Not provided"}
- Institution: ${application.institutionName || "Not provided"}
- Graduation Year: ${application.graduationYear || "Not provided"}
- CGPA: ${application.cgpa || "Not provided"}

Application Status:
- Status: ${application.status.toUpperCase()}
- Submitted: ${application.createdAt ? new Date(application.createdAt).toLocaleDateString() : "Not available"}
- Last Updated: ${application.updatedAt ? new Date(application.updatedAt).toLocaleDateString() : "Not available"}

Agent Information:
- Agent Name: ${application.agent?.name || "Not assigned"}
- Agency: ${application.agent?.agencyName || "Not provided"}

Documents:
${application.documents?.map(doc => `- ${doc.documentType}: ${doc.originalFilename}`).join('\n') || "No documents uploaded"}

Notes:
${application.notes || "No notes"}

Generated on: ${new Date().toLocaleString()}
    `.trim();

    navigator.clipboard.writeText(details);
    toast({
      title: "Copied to Clipboard",
      description: "Application details have been copied to your clipboard.",
    });
  };

  const downloadSingleDocument = async (doc: any) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}`, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to download document");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.originalFilename || doc.filename || `document_${doc.id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: `${doc.originalFilename || doc.filename} is being downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadAllDocuments = async () => {
    try {
      const response = await fetch(`/api/admin/applications/${id}/documents/bulk`, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to download documents");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const studentName = application?.studentName || `${application?.studentFirstName}_${application?.studentLastName}` || "student";
      a.href = url;
      a.download = `${studentName}_all_documents.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Bulk Download Started",
        description: "All documents are being downloaded as a ZIP file.",
      });
    } catch (error) {
      toast({
        title: "Bulk Download Failed",
        description: "Failed to download all documents. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h2>
          <p className="text-gray-600 mb-6">The requested application could not be found.</p>
          <Button onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const studentName = application.studentName || `${application.studentFirstName} ${application.studentLastName}`;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
            <p className="text-gray-600">ID: {application.id}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={copyApplicationDetails} variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Copy Details
          </Button>
          <Button onClick={downloadAllDocuments} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
          <Button
            onClick={() => archiveMutation.mutate()}
            disabled={archiveMutation.isPending}
            variant="outline"
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Application</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this application? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Application
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-lg font-semibold">{studentName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {application.studentEmail}
                  </p>
                </div>
                {application.studentPhone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {application.studentPhone}
                    </p>
                  </div>
                )}
                {application.studentDateOfBirth && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-sm">{application.studentDateOfBirth}</p>
                  </div>
                )}
                {application.studentNationality && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nationality</label>
                    <p className="text-sm">{application.studentNationality}</p>
                  </div>
                )}
                {application.studentGender && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <p className="text-sm">{application.studentGender}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Program Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Program Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Program</label>
                  <p className="text-lg font-semibold">{application.program?.name || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">University</label>
                  <p className="flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    {application.program?.universityName || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Degree Level</label>
                  <p className="text-lg">{application.program?.degree || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Intake</label>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {application.intakeDate || "Not specified"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Background</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.highestQualification && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Highest Qualification</label>
                    <p className="text-sm">{application.highestQualification}</p>
                  </div>
                )}
                {application.qualificationName && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Qualification Name</label>
                    <p className="text-sm">{application.qualificationName}</p>
                  </div>
                )}
                {application.institutionName && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Institution</label>
                    <p className="text-sm">{application.institutionName}</p>
                  </div>
                )}
                {application.graduationYear && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Graduation Year</label>
                    <p className="text-sm">{application.graduationYear}</p>
                  </div>
                )}
                {application.cgpa && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">CGPA</label>
                    <p className="text-sm">{application.cgpa}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(application.status)}
                <Badge variant={getStatusVariant(application.status)}>
                  {application.status.toUpperCase()}
                </Badge>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-gray-500">Submitted</label>
                <p className="text-sm">{application.createdAt ? new Date(application.createdAt).toLocaleDateString() : "Invalid Date"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-sm">{application.updatedAt ? new Date(application.updatedAt).toLocaleDateString() : "Invalid Date"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Uploaded Documents ({application.documents?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.documents && application.documents.length > 0 ? (
                <div className="space-y-3">
                  {application.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{doc.originalFilename}</p>
                          <p className="text-xs text-gray-500">{doc.documentType}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadSingleDocument(doc)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No documents uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agent Information */}
          {application.agent && (
            <Card>
              <CardHeader>
                <CardTitle>Agent Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {application.agent.name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Agent Name</label>
                    <p className="text-sm">{application.agent.name}</p>
                  </div>
                )}
                {application.agent.agencyName && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Agency</label>
                    <p className="text-sm">{application.agent.agencyName}</p>
                  </div>
                )}
                {application.agent.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm">{application.agent.email}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {application.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{application.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}