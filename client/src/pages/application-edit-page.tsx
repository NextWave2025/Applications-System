import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/use-auth";
import { queryClient } from "../lib/query-client";
import { useToast } from "../hooks/use-toast";
import { ProgramWithUniversity, Application, ApplicationWithDetails } from "@shared/schema";
import { formatDistanceToNow, format } from "date-fns";
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
} from "../components/ui/alert-dialog";

// Helper function to format dates consistently
function formatDate(dateString: string | Date): { formatted: string; relative: string } {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return {
    formatted: format(date, 'PPP'), // 'Apr 29, 2023'
    relative: formatDistanceToNow(date, { addSuffix: true }) // '3 days ago'
  };
}

// Define application form schema
const applicationSchema = z.object({
  studentFirstName: z.string().min(1, "Student first name is required"),
  studentLastName: z.string().min(1, "Student last name is required"),
  studentEmail: z.string().email("Please enter a valid email for the student"),
  studentPhone: z.string().min(1, "Student phone number is required"),
  studentNationality: z.string().min(1, "Student nationality is required"),
  studentDateOfBirth: z.string().min(1, "Student date of birth is required"),
  studentGender: z.string().min(1, "Student gender is required"),
  
  // Educational background (matches database schema)
  highestQualification: z.string().min(1, "Highest qualification is required"),
  qualificationName: z.string().min(1, "Name of degree/qualification is required"),
  institutionName: z.string().min(1, "Institution name is required"),
  graduationYear: z.string().min(1, "Graduation year is required"),
  cgpa: z.string().optional(),
  
  // Application details
  intakeDate: z.string().min(1, "Intake date is required"),
  notes: z.string().optional(),
  status: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function ApplicationEditPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [manuallyFetchedApplication, setManuallyFetchedApplication] = useState<ApplicationWithDetails | null>(null);
  
  // Fetch application details
  const { data: application, isLoading: applicationLoading, error: applicationError } = useQuery<ApplicationWithDetails>({
    queryKey: [`/api/applications/${id}`],
    enabled: !!id && !!user,
    staleTime: 30000, // Cache for 30 seconds
    retry: 3, // Retry 3 times
  });
  
  // Document deletion mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete document");
      }
      
      return documentId;
    },
    onSuccess: (documentId) => {
      toast({
        title: "Document Deleted",
        description: "The document has been removed successfully.",
      });
      
      // First update local state immediately to avoid page reload
      if (manuallyFetchedApplication) {
        setManuallyFetchedApplication({
          ...manuallyFetchedApplication,
          documents: manuallyFetchedApplication.documents.filter(doc => doc.id !== documentId)
        });
      }
      
      // Also update the application data in the cache
      if (application) {
        queryClient.setQueryData([`/api/applications/${id}`], {
          ...application,
          documents: application.documents.filter(doc => doc.id !== documentId)
        });
      }
      
      // Finally, invalidate the query to ensure data is refreshed from server
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Manually fetch application for reliability
  useEffect(() => {
    if (id && user) {
      console.log("Manually fetching application with ID:", id);
      fetch(`/api/applications/${id}`, {
        credentials: 'include'
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch application: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log("Manually fetched application:", data);
          setManuallyFetchedApplication(data);
          queryClient.setQueryData([`/api/applications/${id}`], data);
        })
        .catch(err => {
          console.error("Error manually fetching application:", err);
        });
    }
  }, [id, user, queryClient]);

  // Initialize form
  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      studentFirstName: "",
      studentLastName: "",
      studentEmail: "",
      studentPhone: "",
      studentNationality: "",
      studentDateOfBirth: "",
      studentGender: "",
      
      // Educational background
      highestQualification: "",
      qualificationName: "",
      institutionName: "",
      graduationYear: "",
      cgpa: "",
      
      // Application details
      intakeDate: "",
      notes: "",
      status: "",
    },
  });

  // Use manually fetched application as fallback if react-query failed
  const applicationData = application || manuallyFetchedApplication;
  
  // Update form values when application data is loaded
  useEffect(() => {
    if (applicationData) {
      // Format date from ISO string to YYYY-MM-DD
      const dob = new Date(applicationData.studentDateOfBirth);
      const formattedDob = dob.toISOString().split('T')[0];
      
      form.reset({
        studentFirstName: applicationData.studentFirstName,
        studentLastName: applicationData.studentLastName,
        studentEmail: applicationData.studentEmail,
        studentPhone: applicationData.studentPhone,
        studentNationality: applicationData.studentNationality,
        studentDateOfBirth: formattedDob,
        studentGender: applicationData.studentGender,
        
        highestQualification: applicationData.highestQualification,
        qualificationName: applicationData.qualificationName,
        institutionName: applicationData.institutionName,
        graduationYear: applicationData.graduationYear,
        cgpa: applicationData.cgpa || "",
        
        intakeDate: applicationData.intakeDate,
        notes: applicationData.notes || "",
        status: applicationData.status,
      });
    }
  }, [application, manuallyFetchedApplication, form]);

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { state: { redirectTo: `/dashboard/applications/${id}/edit` } });
    }
  }, [authLoading, user, navigate, id]);

  // Update application mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      const response = await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          studentDateOfBirth: new Date(data.studentDateOfBirth),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update application");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      // Upload documents if any
      if (selectedDocuments.length > 0) {
        uploadDocuments(Number(id));
      } else {
        // No documents to upload, show success message and redirect
        toast({
          title: "Application Updated",
          description: "The application has been updated successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
        queryClient.invalidateQueries({ queryKey: [`/api/applications/${id}`] });
        navigate("/dashboard/applications");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update application. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Handle document selection
  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedDocuments((prev) => [...prev, ...newFiles]);
    }
  };

  // Remove a document from selection
  const handleRemoveDocument = (index: number) => {
    setSelectedDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload documents
  const uploadDocuments = async (applicationId: number) => {
    try {
      for (let i = 0; i < selectedDocuments.length; i++) {
        const file = selectedDocuments[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("applicationId", applicationId.toString());
        formData.append("documentType", getDocumentType(file.name));
        formData.append("filename", file.name);
        formData.append("originalFilename", file.name);
        formData.append("fileSize", file.size.toString());
        formData.append("mimeType", file.type);

        await fetch("/api/documents", {
          method: "POST",
          body: formData,
        });

        // Update progress
        setUploadProgress(Math.round(((i + 1) / selectedDocuments.length) * 100));
      }

      // All documents uploaded successfully
      toast({
        title: "Application Updated",
        description: "The application and documents have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${id}`] });
      navigate("/dashboard/applications");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to determine document type
  const getDocumentType = (fileName: string): string => {
    const lowercaseName = fileName.toLowerCase();
    if (lowercaseName.includes("passport")) return "passport";
    if (lowercaseName.includes("transcript")) return "transcript";
    if (lowercaseName.includes("english") || lowercaseName.includes("ielts") || lowercaseName.includes("toefl")) {
      return "english-proficiency";
    }
    if (lowercaseName.includes("recommendation") || lowercaseName.includes("reference")) {
      return "recommendation-letter";
    }
    if (lowercaseName.includes("statement") || lowercaseName.includes("purpose") || lowercaseName.includes("sop")) {
      return "statement-of-purpose";
    }
    return "other";
  };

  // Handle form submission
  const onSubmit = (data: ApplicationFormData) => {
    setIsSubmitting(true);
    updateMutation.mutate(data);
  };

  // Show loading state while checking authentication or fetching application
  if (authLoading || applicationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only show the "Application Not Found" message if we've tried both fetch methods and got no data
  // This prevents the flash of "Application Not Found" message when using manual fetch as a fallback
  const isFetchingComplete = !applicationLoading && (applicationError || application !== undefined);
  const isManualFetchComplete = manuallyFetchedApplication !== null;
  
  if ((isFetchingComplete || isManualFetchComplete) && !application && !manuallyFetchedApplication) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h1>
        <p className="text-gray-600 mb-6">The application you're trying to edit does not exist or you don't have permission to access it.</p>
        <button
          onClick={() => navigate("/dashboard/applications")}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Back to Applications
        </button>
      </div>
    );
  }
  
  // Show loading state if we're still fetching application data
  if (!applicationData && (applicationLoading || manuallyFetchedApplication === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <button onClick={() => navigate("/dashboard")} className="hover:text-primary">
                Dashboard
              </button>
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-gray-400 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <button onClick={() => navigate("/dashboard/applications")} className="hover:text-primary">
                Applications
              </button>
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-gray-400 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-medium">Edit Application</span>
            </li>
          </ol>
        </nav>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Application</h1>
          <p className="mt-2 text-gray-600">
            {applicationData?.program?.name} - {applicationData?.program?.universityName}
          </p>
        </div>

        {/* Application form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-medium text-gray-900">Student Information</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Update the information for this application.
                </p>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* Student name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="studentFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      id="studentFirstName"
                      type="text"
                      {...form.register("studentFirstName")}
                      className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                      placeholder="Student's first name"
                    />
                    {form.formState.errors.studentFirstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.studentFirstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="studentLastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      id="studentLastName"
                      type="text"
                      {...form.register("studentLastName")}
                      className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                      placeholder="Student's last name"
                    />
                    {form.formState.errors.studentLastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.studentLastName.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="studentEmail"
                      type="email"
                      {...form.register("studentEmail")}
                      className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                      placeholder="student@example.com"
                    />
                    {form.formState.errors.studentEmail && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.studentEmail.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="studentPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="studentPhone"
                      type="text"
                      {...form.register("studentPhone")}
                      className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                      placeholder="+1234567890"
                    />
                    {form.formState.errors.studentPhone && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.studentPhone.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Personal details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="studentNationality" className="block text-sm font-medium text-gray-700 mb-1">
                      Nationality
                    </label>
                    <input
                      id="studentNationality"
                      type="text"
                      {...form.register("studentNationality")}
                      className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                      placeholder="Student's nationality"
                    />
                    {form.formState.errors.studentNationality && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.studentNationality.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="studentDateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      id="studentDateOfBirth"
                      type="date"
                      {...form.register("studentDateOfBirth")}
                      className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                    />
                    {form.formState.errors.studentDateOfBirth && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.studentDateOfBirth.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="studentGender" className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      id="studentGender"
                      {...form.register("studentGender")}
                      className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                    {form.formState.errors.studentGender && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.studentGender.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Educational background heading */}
                <div className="pt-6 pb-2">
                  <h3 className="text-lg font-medium text-gray-900">Educational Background</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Please provide details of the student's highest qualification.
                  </p>
                </div>

                {/* Educational details */}
                <div>
                  <label htmlFor="highestQualification" className="block text-sm font-medium text-gray-700 mb-1">
                    Highest Qualification
                  </label>
                  <select
                    id="highestQualification"
                    {...form.register("highestQualification")}
                    className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select qualification level</option>
                    <option value="High School">High School</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Doctorate">Doctorate</option>
                  </select>
                  {form.formState.errors.highestQualification && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.highestQualification.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="qualificationName" className="block text-sm font-medium text-gray-700 mb-1">
                      Name of Degree
                    </label>
                    <input
                      id="qualificationName"
                      type="text"
                      {...form.register("qualificationName")}
                      className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                      placeholder="e.g. Bachelor of Science in Computer Science"
                    />
                    {form.formState.errors.qualificationName && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.qualificationName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700 mb-1">
                      Institution Name
                    </label>
                    <input
                      id="institutionName"
                      type="text"
                      {...form.register("institutionName")}
                      className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                      placeholder="e.g. University of Example"
                    />
                    {form.formState.errors.institutionName && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.institutionName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-1">
                      Graduation Year
                    </label>
                    <input
                      id="graduationYear"
                      type="text"
                      {...form.register("graduationYear")}
                      className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                      placeholder="e.g. 2022"
                    />
                    {form.formState.errors.graduationYear && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.graduationYear.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="cgpa" className="block text-sm font-medium text-gray-700 mb-1">
                      CGPA / Grade
                    </label>
                    <input
                      id="cgpa"
                      type="text"
                      {...form.register("cgpa")}
                      className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                      placeholder="e.g. 3.5/4.0 or A"
                    />
                    {form.formState.errors.cgpa && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.cgpa.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Application details heading */}
                <div className="pt-6 pb-2">
                  <h3 className="text-lg font-medium text-gray-900">Application Preferences</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Please specify your intake preferences.
                  </p>
                </div>

                <div>
                  <label htmlFor="intakeDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Intake
                  </label>
                  <select
                    id="intakeDate"
                    {...form.register("intakeDate")}
                    className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select intake period</option>
                    <option value="Fall 2023">Fall 2023</option>
                    <option value="Spring 2024">Spring 2024</option>
                    <option value="Fall 2024">Fall 2024</option>
                    <option value="Spring 2025">Spring 2025</option>
                  </select>
                  {form.formState.errors.intakeDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.intakeDate.message}
                    </p>
                  )}
                </div>

                {/* Status selection (only for edit page) */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Application Status
                  </label>
                  <select
                    id="status"
                    {...form.register("status")}
                    className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                  >
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="under-review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="incomplete">Incomplete</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    {...form.register("notes")}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                    placeholder="Any additional information or requirements"
                  ></textarea>
                </div>

                {/* Document upload section */}
                <div className="pt-6">
                  <h3 className="text-lg font-medium text-gray-900">Additional Documents</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload supporting documents if you need to add or update them.
                  </p>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Add Documents
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none"
                          >
                            <span>Upload files</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              multiple
                              onChange={handleDocumentSelect}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, PNG, JPG, GIF up to 10MB each
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Selected documents list */}
                  {selectedDocuments.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700">Selected Documents</h4>
                      <ul className="mt-2 divide-y divide-gray-200 border rounded-md">
                        {selectedDocuments.map((file, index) => (
                          <li key={index} className="flex items-center justify-between py-3 px-4">
                            <div className="flex items-center">
                              <svg
                                className="h-5 w-5 text-gray-400 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <span className="text-sm text-gray-900 truncate max-w-xs">
                                {file.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocument(index)}
                              className="ml-2 text-sm text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Existing documents list */}
                  {applicationData?.documents && applicationData.documents.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700">Current Documents</h4>
                      <ul className="mt-2 divide-y divide-gray-200 border rounded-md">
                        {applicationData.documents.map((doc) => (
                          <li key={doc.id} className="flex items-center justify-between py-3 px-4">
                            <div className="flex items-center">
                              <svg
                                className="h-5 w-5 text-gray-400 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <span className="text-sm text-gray-900">
                                {doc.originalFilename} ({doc.documentType})
                              </span>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  type="button"
                                  className="ml-2 text-sm text-red-600 hover:text-red-800"
                                >
                                  Remove
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this document? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteDocumentMutation.mutate(doc.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Form submission buttons */}
                <div className="pt-6 flex items-center justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard/applications")}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-primary text-white rounded-md shadow-sm text-sm font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      "Update Application"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Program sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-medium text-gray-900">Program Details</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  {applicationData?.program?.universityLogo ? (
                    <img
                      src={applicationData.program.universityLogo}
                      alt={applicationData.program.universityName}
                      className="h-16 w-16 object-contain rounded-md mr-3"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                      <span className="text-gray-500 text-xl font-medium">
                        {applicationData?.program?.universityName?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{applicationData?.program?.universityName}</h3>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Program</h4>
                    <p className="mt-1">{applicationData?.program?.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Degree Level</h4>
                    <p className="mt-1">{applicationData?.program?.degree}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Application Status</h4>
                    <div className="mt-1">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${applicationData?.status === "approved" ? "bg-green-100 text-green-800" : ""}
                        ${applicationData?.status === "rejected" ? "bg-red-100 text-red-800" : ""}
                        ${applicationData?.status === "under-review" ? "bg-blue-100 text-blue-800" : ""}
                        ${applicationData?.status === "submitted" ? "bg-purple-100 text-purple-800" : ""}
                        ${applicationData?.status === "draft" ? "bg-gray-100 text-gray-800" : ""}
                        ${applicationData?.status === "incomplete" ? "bg-yellow-100 text-yellow-800" : ""}
                      `}>
                        {applicationData?.status 
                          ? applicationData.status.charAt(0).toUpperCase() + applicationData.status.slice(1).replace("-", " ") 
                          : "Unknown"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Submission Date</h4>
                    <p className="mt-1">
                      {applicationData?.createdAt ? formatDate(applicationData.createdAt).formatted : ''} 
                      <span className="text-xs text-gray-400 block">
                        {applicationData?.createdAt ? formatDate(applicationData.createdAt).relative : ''}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Last Updated</h4>
                    <p className="mt-1">
                      {applicationData?.updatedAt ? formatDate(applicationData.updatedAt).formatted : ''} 
                      <span className="text-xs text-gray-400 block">
                        {applicationData?.updatedAt ? formatDate(applicationData.updatedAt).relative : ''}
                      </span>
                    </p>
                  </div>
                  
                  {/* Admin Notes - Only show if there are admin notes */}
                  {applicationData?.adminNotes && (
                    <div className="col-span-2 pt-4 border-t mt-4">
                      <h4 className="text-sm font-medium text-gray-700">Admin Notes</h4>
                      <div className="mt-1 p-3 bg-blue-50 text-blue-800 rounded-md">
                        <p className="text-sm">{applicationData.adminNotes}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Rejection Reason - Only show if the application is rejected */}
                  {applicationData?.rejectionReason && applicationData.status === "rejected" && (
                    <div className="col-span-2 pt-4 border-t mt-4">
                      <h4 className="text-sm font-medium text-red-700">Rejection Reason</h4>
                      <div className="mt-1 p-3 bg-red-50 text-red-800 rounded-md">
                        <p className="text-sm">{applicationData.rejectionReason}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Conditional Offer Terms - Only show if it has conditional offer terms */}
                  {applicationData?.conditionalOfferTerms && applicationData.status === "accepted-conditional-offer" && (
                    <div className="col-span-2 pt-4 border-t mt-4">
                      <h4 className="text-sm font-medium text-green-700">Conditional Offer Terms</h4>
                      <div className="mt-1 p-3 bg-green-50 text-green-800 rounded-md">
                        <p className="text-sm">{applicationData.conditionalOfferTerms}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Status History - Only show if there is status history available */}
                  {applicationData?.statusHistory && applicationData.statusHistory.length > 0 && (
                    <div className="col-span-2 pt-4 border-t mt-4">
                      <h4 className="text-sm font-medium text-gray-700">Status History</h4>
                      <div className="mt-1 space-y-2">
                        {applicationData.statusHistory.map((history, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-md">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">
                                {history.fromStatus.replace(/-/g, ' ')} → {history.toStatus.replace(/-/g, ' ')}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(history.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            {history.notes && (
                              <p className="text-xs text-gray-600 mt-1">{history.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}