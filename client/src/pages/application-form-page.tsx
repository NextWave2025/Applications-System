import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/use-auth";
import { queryClient } from "../lib/query-client";
import { useToast } from "../hooks/use-toast";
import { ProgramWithUniversity } from "@shared/schema";

// Define application form schema
const applicationSchema = z.object({
  studentFirstName: z.string().min(1, "Student first name is required"),
  studentLastName: z.string().min(1, "Student last name is required"),
  studentEmail: z.string().email("Please enter a valid email for the student"),
  studentPhone: z.string().min(1, "Student phone number is required"),
  studentNationality: z.string().min(1, "Student nationality is required"),
  studentDateOfBirth: z.string().min(1, "Student date of birth is required"),
  studentGender: z.string().min(1, "Student gender is required"),
  educationLevel: z.string().min(1, "Current education level is required"),
  preferredIntake: z.string().min(1, "Preferred intake is required"),
  englishProficiency: z.string().min(1, "English proficiency is required"),
  notes: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function ApplicationFormPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch program details
  const { data: program, isLoading: programLoading } = useQuery<ProgramWithUniversity>({
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
      educationLevel: "",
      preferredIntake: program?.intake ? program.intake[0] : "",
      englishProficiency: "",
      notes: "",
    },
  });

  // Update form value when program data is loaded
  useEffect(() => {
    if (program && program.intake && program.intake.length > 0) {
      form.setValue("preferredIntake", program.intake[0]);
    }
  }, [program, form]);

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { state: { redirectTo: `/apply/${id}` } });
    }
  }, [authLoading, user, navigate, id]);

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
      if (selectedDocuments.length > 0) {
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
        formData.append("type", getDocumentType(file.name));

        await fetch("/api/documents", {
          method: "POST",
          body: formData,
        });

        // Update progress
        setUploadProgress(Math.round(((i + 1) / selectedDocuments.length) * 100));
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

                {/* Education details */}
                <div>
                  <label htmlFor="educationLevel" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Education Level
                  </label>
                  <select
                    id="educationLevel"
                    {...form.register("educationLevel")}
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
                  {form.formState.errors.educationLevel && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.educationLevel.message}
                    </p>
                  )}
                </div>

                {/* Intake preferences */}
                <div>
                  <label htmlFor="preferredIntake" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Intake
                  </label>
                  <select
                    id="preferredIntake"
                    {...form.register("preferredIntake")}
                    className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select an option</option>
                    {program.intake && Array.isArray(program.intake) ? 
                      program.intake.map((intake, index) => (
                        <option key={index} value={intake}>
                          {intake}
                        </option>
                      )) : 
                      program.intake && (
                        <option value={program.intake}>{program.intake}</option>
                      )
                    }
                  </select>
                  {form.formState.errors.preferredIntake && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.preferredIntake.message}
                    </p>
                  )}
                </div>

                {/* English proficiency */}
                <div>
                  <label htmlFor="englishProficiency" className="block text-sm font-medium text-gray-700 mb-1">
                    English Proficiency
                  </label>
                  <select
                    id="englishProficiency"
                    {...form.register("englishProficiency")}
                    className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select an option</option>
                    <option value="IELTS">IELTS</option>
                    <option value="TOEFL">TOEFL</option>
                    <option value="Duolingo">Duolingo</option>
                    <option value="Native">Native English Speaker</option>
                    <option value="None">No English Test</option>
                  </select>
                  {form.formState.errors.englishProficiency && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.englishProficiency.message}
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

                {/* Documents upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Documents
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
                            multiple
                            className="sr-only"
                            onChange={handleDocumentSelect}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        Passport, transcripts, certificates, etc.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Selected documents list */}
                {selectedDocuments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Documents</h3>
                    <ul className="space-y-2">
                      {selectedDocuments.map((file, index) => (
                        <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

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