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
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  studentAddress?: string;
  programName: string;
  universityName: string;
  degreeLevel: string;
  intake: string;
  submissionDate: string;
  status: string;
  lastUpdated: string;
  agentName?: string;
  agentCompany?: string;
  notes?: string;
  documents?: {
    passport?: boolean;
    transcript?: boolean;
    englishCertificate?: boolean;
    recommendationLetters?: boolean;
    statementOfPurpose?: boolean;
  };
  personalStatement?: string;
  academicBackground?: string;
  workExperience?: string;
  englishProficiency?: string;
  additionalDocuments?: string[];
}

export default function ApplicationDetailsPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);

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

    const details = `
APPLICATION DETAILS
==================

Student Information:
- Name: ${application.studentName}
- Email: ${application.studentEmail}
- Phone: ${application.studentPhone || "Not provided"}
- Address: ${application.studentAddress || "Not provided"}

Program Information:
- Program: ${application.programName}
- University: ${application.universityName}
- Degree Level: ${application.degreeLevel}
- Intake: ${application.intake}

Application Status:
- Status: ${application.status.toUpperCase()}
- Submission Date: ${new Date(application.submissionDate).toLocaleDateString()}
- Last Updated: ${new Date(application.lastUpdated).toLocaleDateString()}

Agent Information:
- Agent Name: ${application.agentName || "Not assigned"}
- Agent Company: ${application.agentCompany || "Not provided"}

Academic Background:
${application.academicBackground || "Not provided"}

Work Experience:
${application.workExperience || "Not provided"}

English Proficiency:
${application.englishProficiency || "Not provided"}

Personal Statement:
${application.personalStatement || "Not provided"}

Documents Status:
- Passport: ${application.documents?.passport ? "✓ Submitted" : "✗ Missing"}
- Transcript: ${application.documents?.transcript ? "✓ Submitted" : "✗ Missing"}
- English Certificate: ${application.documents?.englishCertificate ? "✓ Submitted" : "✗ Missing"}
- Recommendation Letters: ${application.documents?.recommendationLetters ? "✓ Submitted" : "✗ Missing"}
- Statement of Purpose: ${application.documents?.statementOfPurpose ? "✓ Submitted" : "✗ Missing"}

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

  const downloadDocument = async (documentType: string) => {
    try {
      const response = await fetch(`/api/admin/applications/${id}/documents/${documentType}`, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to download document");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${application?.studentName}_${documentType}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: `${documentType} document is being downloaded.`,
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
      a.href = url;
      a.download = `${application?.studentName}_all_documents.zip`;
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
                  <p className="text-lg font-semibold">{application.studentName}</p>
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
                {application.studentAddress && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {application.studentAddress}
                    </p>
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
                  <p className="text-lg font-semibold">{application.programName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">University</label>
                  <p className="flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    {application.universityName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Degree Level</label>
                  <p>{application.degreeLevel}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Intake</label>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {application.intake}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic & Professional Details */}
          {(application.academicBackground || application.workExperience || application.personalStatement) && (
            <Card>
              <CardHeader>
                <CardTitle>Academic & Professional Background</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {application.academicBackground && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Academic Background</label>
                    <p className="mt-1 whitespace-pre-wrap">{application.academicBackground}</p>
                  </div>
                )}
                {application.workExperience && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Work Experience</label>
                    <p className="mt-1 whitespace-pre-wrap">{application.workExperience}</p>
                  </div>
                )}
                {application.personalStatement && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Personal Statement</label>
                    <p className="mt-1 whitespace-pre-wrap">{application.personalStatement}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
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
                  {application.status.replace("-", " ").toUpperCase()}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">Submitted</label>
                  <p className="text-sm">{new Date(application.submissionDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm">{new Date(application.lastUpdated).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Information */}
          {(application.agentName || application.agentCompany) && (
            <Card>
              <CardHeader>
                <CardTitle>Agent Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {application.agentName && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Agent Name</label>
                    <p>{application.agentName}</p>
                  </div>
                )}
                {application.agentCompany && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Company</label>
                    <p>{application.agentCompany}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {application.documents && Object.entries(application.documents).map(([key, submitted]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {submitted ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  {submitted && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadDocument(key)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          {application.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{application.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}