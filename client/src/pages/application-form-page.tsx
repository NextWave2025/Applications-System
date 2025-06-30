import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/use-auth";
import { queryClient } from "../lib/query-client";
import { useToast } from "../hooks/use-toast";
import { ProgramWithUniversity } from "@shared/schema";
import { Upload, X, FileText, Plus } from "lucide-react";

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
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function ApplicationFormPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<Array<{
    id: string;
    file: File | null;
    documentType: string;
    description: string;
    isUploading: boolean;
  }>>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch program details
  const { data: program, isLoading: programLoading, error: programError } = useQuery<ProgramWithUniversity>({
    queryKey: [`/api/programs/${id}`],
    enabled: !!id,
    staleTime: 60000, // Cache for 1 minute
    retry: 3, // Retry 3 times
  });

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
      intakeDate: program?.intake ? program.intake[0] : "",
      notes: "",
    },
  });

  // Update form value when program data is loaded
  useEffect(() => {
    if (program && program.intake && program.intake.length > 0) {
      form.setValue("intakeDate", program.intake[0]);
    }
  }, [program, form]);

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!authLoading && !user) {
      // Store the current application URL and action type for later redirect
      localStorage.setItem("redirectAfterLogin", `/apply/${id}`);
      localStorage.setItem("applicationAction", "apply");
      localStorage.setItem("programId", id || "");
      navigate("/auth");
    }
  }, [authLoading, user, navigate, id]);

  // Handle program not found after authentication redirect
  useEffect(() => {
    if (user && programError) {
      toast({
        variant: "destructive",
        title: "Program Not Available",
        description: "The program you selected is no longer available. Please choose another program.",
      });
      navigate("/programs");
    }
  }, [user, programError, toast, navigate]);

  // Submit application mutation
  const applicationMutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      const response = await fetch(`/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          programId: Number(id),
          ...data,
          studentDateOfBirth: new Date(data.studentDateOfBirth),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit application");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      // Upload documents if any
      const documentsWithFiles = documents.filter(doc => doc.file);
      if (documentsWithFiles.length > 0) {
        uploadDocuments(data.id);
      } else {
        // No documents to upload, show success message and redirect
        toast({
          title: "Application Submitted",
          description: "Your application has been submitted successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
        navigate("/dashboard/applications");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Add new document slot
  const addDocumentSlot = () => {
    const newDoc = {
      id: Math.random().toString(36).substr(2, 9),
      file: null,
      documentType: "",
      description: "",
      isUploading: false,
    };
    setDocuments(prev => [...prev, newDoc]);
  };

  // Remove document slot
  const removeDocumentSlot = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  // Update document file
  const updateDocumentFile = (docId: string, file: File) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, file } : doc
    ));
  };

  // Update document description
  const updateDocumentDescription = (docId: string, description: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, description } : doc
    ));
  };

  // Upload documents
  const uploadDocuments = async (applicationId: number) => {
    try {
      const documentsWithFiles = documents.filter(doc => doc.file);
      
      for (let i = 0; i < documentsWithFiles.length; i++) {
        const doc = documentsWithFiles[i];
        
        // Mark as uploading
        setDocuments(prev => prev.map(d => 
          d.id === doc.id ? { ...d, isUploading: true } : d
        ));

        const formData = new FormData();
        formData.append("file", doc.file!);
        formData.append("applicationId", applicationId.toString());
        formData.append("documentType", doc.description || getDocumentType(doc.file!.name));
        formData.append("filename", doc.file!.name);
        formData.append("originalFilename", doc.file!.name);
        formData.append("fileSize", doc.file!.size.toString());
        formData.append("mimeType", doc.file!.type);

        const response = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${doc.description || doc.file!.name}`);
        }

        // Update progress
        setUploadProgress(Math.round(((i + 1) / documentsWithFiles.length) * 100));
      }

      // All documents uploaded successfully
      toast({
        title: "Application Submitted",
        description: "Your application and documents have been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      navigate("/dashboard/applications");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      // Reset uploading states
      setDocuments(prev => prev.map(doc => ({ ...doc, isUploading: false })));
    }
  };

  // Helper function to determine document type
  const getDocumentType = (fileName: string): string => {
    const lowercaseName = fileName.toLowerCase();
    if (lowercaseName.includes("passport")) return "passport";
    if (lowercaseName.includes("transcript")) return "transcript";
    if (lowercaseName.includes("english") || lowercaseName.includes("ielts") || lowercaseName.includes("toefl")) {
      return "english_certificate";
    }
    if (lowercaseName.includes("recommendation") || lowercaseName.includes("reference")) {
      return "recommendation_letter";
    }
    if (lowercaseName.includes("statement") || lowercaseName.includes("purpose") || lowercaseName.includes("sop")) {
      return "statement_of_purpose";
    }
    return "other";
  };

  // Handle form submission
  const onSubmit = (data: ApplicationFormData) => {
    setIsSubmitting(true);
    applicationMutation.mutate(data);
  };

  // Show loading state while checking authentication or fetching program
  if (authLoading || programLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If program not found
  if (!program) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Program Not Found</h1>
        <p className="text-gray-600 mb-6">The program you're trying to apply for does not exist.</p>
        <button
          onClick={() => navigate("/programs")}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Browse Programs
        </button>
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
              <button onClick={() => navigate("/programs")} className="hover:text-primary">
                Programs
              </button>
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-gray-400 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <button onClick={() => navigate(`/programs/${id}`)} className="hover:text-primary">
                {program.name}
              </button>
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-gray-400 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-medium">Application</span>
            </li>
          </ol>
        </nav>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Apply for {program.name}</h1>
          <p className="mt-2 text-gray-600">
            {program.university?.name} - {program.degree} - {program.duration}
          </p>
        </div>

        {/* Application form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-medium text-gray-900">Student Information</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Please enter accurate information for the student you are representing.
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

                {/* Education details heading */}
                <div className="pt-6 pb-2">
                  <h3 className="text-lg font-medium text-gray-900">Educational Background</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Please provide information about the student's educational history.
                  </p>
                </div>

                {/* Highest qualification */}
                <div>
                  <label htmlFor="highestQualification" className="block text-sm font-medium text-gray-700 mb-1">
                    Highest Qualification
                  </label>
                  <select
                    id="highestQualification"
                    {...form.register("highestQualification")}
                    className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select an option</option>
                    <option value="High School">High School</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="PhD">PhD</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Other">Other</option>
                  </select>
                  {form.formState.errors.highestQualification && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.highestQualification.message}
                    </p>
                  )}
                </div>

                {/* Qualification name and institution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="qualificationName" className="block text-sm font-medium text-gray-700 mb-1">
                      Name of Degree/Qualification
                    </label>
                    <input
                      id="qualificationName"
                      type="text"
                      {...form.register("qualificationName")}
                      className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                      placeholder="e.g., Bachelor of Science in Computer Science"
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
                      placeholder="Name of school or university"
                    />
                    {form.formState.errors.institutionName && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.institutionName.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Graduation year and CGPA */}
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
                      placeholder="e.g., 2022"
                    />
                    {form.formState.errors.graduationYear && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.graduationYear.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="cgpa" className="block text-sm font-medium text-gray-700 mb-1">
                      CGPA/Grade (Optional)
                    </label>
                    <input
                      id="cgpa"
                      type="text"
                      {...form.register("cgpa")}
                      className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                      placeholder="e.g., 3.8/4.0 or 85%"
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

                {/* Intake date */}
                <div>
                  <label htmlFor="intakeDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Intake
                  </label>
                  <select
                    id="intakeDate"
                    {...form.register("intakeDate")}
                    className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select an option</option>
                    <option value="January">January</option>
                    <option value="September">September</option>
                    <option value="May">May</option>
                  </select>
                  {form.formState.errors.intakeDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.intakeDate.message}
                    </p>
                  )}
                </div>

                {/* Additional notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    {...form.register("notes")}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                    placeholder="Any additional information about the student or their application..."
                  ></textarea>
                </div>

                {/* Documents upload section */}
                <div className="pt-6 pb-2">
                  <h3 className="text-lg font-medium text-gray-900">Supporting Documents</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload your supporting documents. Each document should have a clear description.
                  </p>
                </div>

                {/* Individual document uploads */}
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Document description */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Document Description
                          </label>
                          <input
                            type="text"
                            value={doc.description}
                            onChange={(e) => updateDocumentDescription(doc.id, e.target.value)}
                            placeholder="e.g., Passport, Transcript, IELTS Certificate"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                          />
                        </div>

                        {/* File upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select File
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  updateDocumentFile(doc.id, file);
                                }
                              }}
                              className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            />
                            <button
                              type="button"
                              onClick={() => removeDocumentSlot(doc.id)}
                              className="p-2 text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Show selected file info */}
                      {doc.file && (
                        <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
                          <FileText className="h-4 w-4" />
                          <span>{doc.file.name}</span>
                          <span className="text-gray-400">
                            ({(doc.file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                          {doc.isUploading && (
                            <div className="flex items-center space-x-1">
                              <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-primary">Uploading...</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add document button */}
                  <button
                    type="button"
                    onClick={addDocumentSlot}
                    className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Plus className="h-5 w-5" />
                      <span>Add Document</span>
                    </div>
                  </button>
                </div>

                {/* Submit button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-primary text-white font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        {uploadProgress > 0 ? `Uploading Documents (${uploadProgress}%)` : "Submitting Application..."}
                      </div>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Application information sidebar */}
          <div>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">Application Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Program</h4>
                  <p className="mt-1 text-gray-900">{program.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">University</h4>
                  <p className="mt-1 text-gray-900">{program.university?.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Degree Level</h4>
                  <p className="mt-1 text-gray-900">{program.degree}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Duration</h4>
                  <p className="mt-1 text-gray-900">{program.duration}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Tuition Fee</h4>
                  <p className="mt-1 text-gray-900">AED {program.tuition?.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Available Intakes</h4>
                  <p className="mt-1 text-gray-900">
                    {program.intake && Array.isArray(program.intake) 
                      ? program.intake.join(", ") 
                      : program.intake || "Not specified"}
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700">Required Documents</h4>
                  <ul className="mt-2 space-y-1 text-sm text-gray-700">
                    <li className="flex items-center">
                      <svg className="h-4 w-4 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Passport Copy
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Academic Transcripts
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      English Proficiency Certificate
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Statement of Purpose
                    </li>
                    <li className="flex items-center">
                      <svg className="h-4 w-4 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Recommendation Letters (if available)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}