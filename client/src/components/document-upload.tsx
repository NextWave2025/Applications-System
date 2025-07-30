import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Upload, FileText, User, Mail, Phone } from "lucide-react";

export default function DocumentUpload() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    applicationId: "",
    notes: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate file upload
    setTimeout(() => {
      alert(
        "Documents uploaded successfully! We'll review them and get back to you soon.",
      );
      setFormData({
        name: "",
        email: "",
        phone: "",
        applicationId: "",
        notes: "",
      });
      setFiles([]);
      setIsSubmitting(false);
    }, 2000);
  };

  const acceptedFileTypes = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

  return (
    <section id="document-upload" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-primary/20 rounded-full text-primary font-bold mb-6 text-sm">
              <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
              Document Upload
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Submit Your <span className="text-primary">Documents</span>
            </h2>
            <p className="text-lg text-gray-600">
              Upload your required documents to move forward with your
              application.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                    className="border-gray-300 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="your.email@example.com"
                    className="border-gray-300 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    WhatsApp Number *
                  </label>
                  <Input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+971 50 123 4567"
                    className="border-gray-300 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference/Application ID
                  </label>
                  <Input
                    type="text"
                    value={formData.applicationId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        applicationId: e.target.value,
                      })
                    }
                    placeholder="If you have one from previous communication"
                    className="border-gray-300 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="w-4 h-4 inline mr-1" />
                  Upload Documents *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition-colors">
                  <input
                    type="file"
                    multiple
                    accept={acceptedFileTypes}
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    required
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center text-center"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <span className="text-lg font-medium text-gray-700 mb-2">
                      Click to upload files
                    </span>
                    <span className="text-sm text-gray-500">
                      PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                    </span>
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Selected files:
                    </p>
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        <span>{file.name}</span>
                        <span className="ml-auto text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Any additional information or questions you'd like to share..."
                  rows={3}
                  className="border-gray-300 focus:border-primary"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">
                  Document Checklist:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Academic transcripts/certificates</li>
                  <li>• Passport copy</li>
                  <li>• English proficiency test results (IELTS/TOEFL)</li>
                  <li>• Personal statement/motivation letter</li>
                  <li>• Letters of recommendation (if available)</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 text-lg"
              >
                {isSubmitting ? "Uploading Documents..." : "Submit Documents"}
              </Button>

              <p className="text-sm text-gray-500 text-center">
                Your documents are securely encrypted and stored. We'll review
                them within 2 business days.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
