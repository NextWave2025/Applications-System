import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { 
  Copy, Download, Upload, Eye, FileText, User, School, 
  Calendar, Mail, Phone, MapPin, CheckCircle, AlertCircle,
  ArrowLeft, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ApplicationWithDetails {
  id: number;
  userId: number;
  programId: number;
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
  cgpa: string;
  intakeDate: string;
  notes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  program: {
    name: string;
    universityName: string;
    universityLogo: string;
    degree: string;
  };
  documents: Array<{
    id: number;
    documentType: string;
    originalFilename: string;
    filePath: string;
  }>;
  statusHistory?: Array<{
    fromStatus: string;
    toStatus: string;
    timestamp: string;
    notes: string;
    userDetails?: {
      firstName: string;
      lastName: string;
      username: string;
    };
  }>;
  adminNotes?: string;
  rejectionReason?: string;
  conditionalOfferTerms?: string;
}

export default function AdminApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [application, setApplication] = useState<ApplicationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [updateMessage, setUpdateMessage] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/admin");
      return;
    }

    fetchApplicationDetails();
  }, [id, user, navigate]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("GET", `/api/admin/applications/${id}`);
      const data = await response.json();
      setApplication(data);
    } catch (error) {
      console.error("Error fetching application details:", error);
      toast({
        title: "Error",
        description: "Failed to load application details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`
      });
    });
  };

  const copyAllApplicationDetails = () => {
    if (!application) return;

    const details = `
STUDENT APPLICATION DETAILS
===========================

PERSONAL INFORMATION:
- Full Name: ${application.studentFirstName} ${application.studentLastName}
- Email: ${application.studentEmail}
- Phone: ${application.studentPhone}
- Date of Birth: ${application.studentDateOfBirth}
- Nationality: ${application.studentNationality}
- Gender: ${application.studentGender}

ACADEMIC INFORMATION:
- Highest Qualification: ${application.highestQualification}
- Qualification Name: ${application.qualificationName}
- Institution: ${application.institutionName}
- Graduation Year: string;
  cgpa: string;

PROGRAM DETAILS:
- Program: ${application.program.name}
- University: ${application.program.universityName}
- Degree Level: ${application.program.degree}
- Intake Date: ${application.intakeDate}

APPLICATION STATUS:
- Current Status: ${application.status.replace(/-/g, ' ').toUpperCase()}
- Submission Date: ${format(new Date(application.createdAt), 'PPP')}
- Last Updated: ${format(new Date(application.updatedAt), 'PPP')}

ADDITIONAL NOTES:
${application.notes || 'No additional notes'}

${application.adminNotes ? \`ADMIN NOTES:\n${application.adminNotes}\` : ''}
${application.rejectionReason ? \`REJECTION REASON:\n${application.rejectionReason}\` : ''}
${application.conditionalOfferTerms ? \`CONDITIONAL OFFER TERMS:\n${application.conditionalOfferTerms}\` : ''}

APPLICATION ID: ${application.id}
    `.trim();

    copyToClipboard(details, "Application details");
  };

  const downloadDocument = async (documentId: number, filename: string) => {
    try {
      const response = await apiRequest("GET", \`/api/documents/\${documentId}/download\`);

      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display: 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Downloaded",
        description: `${filename} downloaded successfully`
      });
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive"
      });
    }
  };

  const downloadAllDocuments = async () => {
    if (!application?.documents?.length) return;

    for (const doc of application.documents) {
      await downloadDocument(doc.id, doc.originalFilename);
      // Add small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !updateMessage.trim()) {
      toast({
        title: "Error",
        description: "Please select a file and add an update message",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', 'admin-update');
      formData.append('applicationId', id!);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // Send update notification
      await apiRequest("POST", `/api/admin/applications/${id}/send-update`, {
        message: updateMessage,
        hasDocument: true,
        documentName: selectedFile.name
      });

      toast({
        title: "Success",
        description: "Update sent to agent and student"
      });

      setSelectedFile(null);
      setUpdateMessage("");
      fetchApplicationDetails(); // Refresh to show new document
    } catch (error) {
      console.error("Error uploading update:", error);
      toast({
        title: "Error",
        description: "Failed to send update",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const sendMessageUpdate = async () => {
    if (!updateMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter an update message",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiRequest("POST", `/api/admin/applications/${id}/send-update`, {
        message: updateMessage,
        hasDocument: false
      });

      toast({
        title: "Success",
        description: "Update sent to agent and student"
      });

      setUpdateMessage("");
    } catch (error) {
      console.error("Error sending update:", error);
      toast({
        title: "Error",
        description: "Failed to send update",
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "under-review": return "bg-blue-100 text-blue-800";
      case "submitted": return "bg-purple-100 text-purple-800";
      case "draft": return "bg-gray-100 text-gray-800";
      case "incomplete": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!user || user.role !== "admin") {
    return <div>Access denied</div>;
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Application Not Found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Application Details</h1>
            <p className="text-muted-foreground">
              {application.studentFirstName} {application.studentLastName} - Application #{application.id}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={copyAllApplicationDetails} variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Copy All Details
          </Button>
          <Button onClick={downloadAllDocuments} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download All Documents
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Application Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">Status History</TabsTrigger>
          <TabsTrigger value="updates">Send Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Full Name</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-sm">{application.studentFirstName} {application.studentLastName}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(`${application.studentFirstName} ${application.studentLastName}`, "Student name")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Gender</Label>
                    <p className="text-sm mt-1">{application.studentGender}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-sm">{application.studentEmail}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(application.studentEmail, "Email")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-sm">{application.studentPhone}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(application.studentPhone, "Phone")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Date of Birth</Label>
                    <p className="text-sm mt-1">{application.studentDateOfBirth}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Nationality</Label>
                    <p className="text-sm mt-1">{application.studentNationality}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <School className="h-5 w-5 mr-2" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Highest Qualification</Label>
                  <p className="text-sm mt-1">{application.highestQualification}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Qualification Name</Label>
                  <p className="text-sm mt-1">{application.qualificationName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Institution</Label>
                  <p className="text-sm mt-1">{application.institutionName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Graduation Year</Label>
                    <p className="text-sm mt-1">{application.graduationYear}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">CGPA</Label>
                    <p className="text-sm mt-1">{application.cgpa}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Program & Status Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Program & Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Program</Label>
                  <p className="text-sm mt-1">{application.program.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">University</Label>
                  <p className="text-sm mt-1">{application.program.universityName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Degree Level</Label>
                  <p className="text-sm mt-1">{application.program.degree}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Intake Date</Label>
                  <p className="text-sm mt-1">{application.intakeDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Current Status</Label>
                  <Badge className={`mt-1 ${getStatusBadgeColor(application.status)}`}>
                    {application.status.replace(/-/g, ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Submitted</Label>
                    <p className="text-sm mt-1">{format(new Date(application.createdAt), 'PP')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <p className="text-sm mt-1">{format(new Date(application.updatedAt), 'PP')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Notes */}
          {(application.notes || application.adminNotes || application.rejectionReason || application.conditionalOfferTerms) && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {application.notes && (
                  <div>
                    <Label className="text-sm font-medium">Student Notes</Label>
                    <div className="flex items-start space-x-2 mt-1">
                      <p className="text-sm bg-gray-50 p-3 rounded-md flex-1">{application.notes}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(application.notes, "Student notes")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                {application.adminNotes && (
                  <div>
                    <Label className="text-sm font-medium">Admin Notes</Label>
                    <div className="flex items-start space-x-2 mt-1">
                      <p className="text-sm bg-blue-50 p-3 rounded-md flex-1">{application.adminNotes}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(application.adminNotes!, "Admin notes")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                {application.rejectionReason && (
                  <div>
                    <Label className="text-sm font-medium">Rejection Reason</Label>
                    <div className="flex items-start space-x-2 mt-1">
                      <p className="text-sm bg-red-50 p-3 rounded-md flex-1">{application.rejectionReason}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(application.rejectionReason!, "Rejection reason")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                {application.conditionalOfferTerms && (
                  <div>
                    <Label className="text-sm font-medium">Conditional Offer Terms</Label>
                    <div className="flex items-start space-x-2 mt-1">
                      <p className="text-sm bg-green-50 p-3 rounded-md flex-1">{application.conditionalOfferTerms}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(application.conditionalOfferTerms!, "Conditional offer terms")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Application Documents ({application.documents?.length || 0})
                </span>
                <Button onClick={downloadAllDocuments} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.documents && application.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {application.documents.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.originalFilename}</p>
                          <p className="text-xs text-muted-foreground">{doc.documentType}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadDocument(doc.id, doc.originalFilename)}
                          className="flex-1"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(doc.originalFilename, "Document name")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents uploaded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Status History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.statusHistory && application.statusHistory.length > 0 ? (
                <div className="space-y-4">
                  {application.statusHistory.map((history, index) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {history.fromStatus.replace(/-/g, ' ')} → {history.toStatus.replace(/-/g, ' ')}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(history.timestamp), 'PPp')}
                        </span>
                      </div>
                      {history.userDetails && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Updated by: {history.userDetails.firstName} {history.userDetails.lastName}
                        </p>
                      )}
                      {history.notes && (
                        <div className="flex items-start space-x-2 mt-2">
                          <p className="text-sm bg-gray-50 p-2 rounded text-gray-700 flex-1">{history.notes}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(history.notes, "Status note")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No status history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="h-5 w-5 mr-2" />
                Send Updates to Agent & Student
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="update-message">Update Message</Label>
                <Textarea
                  id="update-message"
                  placeholder="Enter your update message for the agent and student..."
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>

              <Separator />

              <div>
                <Label htmlFor="file-upload">Attach Document (Optional)</Label>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={sendMessageUpdate}
                  disabled={!updateMessage.trim()}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Message Only
                </Button>
                {selectedFile && (
                  <Button
                    onClick={handleFileUpload}
                    disabled={uploading || !updateMessage.trim()}
                    className="flex-1"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Send with Document
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}