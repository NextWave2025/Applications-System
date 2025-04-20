import { useState } from "react";

interface ProgramDetailTabsProps {
  className?: string;
  program: {
    description: string;
    entryRequirements: string[];
    documentsNeeded: string[];
    tuitionFee: number;
  };
}

export default function ProgramDetailTabs({
  className,
  program
}: ProgramDetailTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className={className}>
      <div className="border-b">
        <div className="flex overflow-x-auto">
          <button
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "overview"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "requirements"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("requirements")}
          >
            Entry Requirements
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "documents"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("documents")}
          >
            Required Documents
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "fees"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("fees")}
          >
            Tuition & Fees
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Program Overview</h3>
            <div className="text-gray-600">
              {program.description}
            </div>
          </div>
        )}
        
        {activeTab === "requirements" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Entry Requirements</h3>
            {program.entryRequirements.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                {program.entryRequirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Information not available.</p>
            )}
          </div>
        )}
        
        {activeTab === "documents" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Required Documents</h3>
            {program.documentsNeeded.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                {program.documentsNeeded.map((document, index) => (
                  <li key={index}>{document}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Information not available.</p>
            )}
          </div>
        )}
        
        {activeTab === "fees" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tuition & Fees</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Tuition Fee</span>
                <span className="font-semibold">
                  {program.tuitionFee 
                    ? new Intl.NumberFormat('en-US', { 
                        style: 'currency', 
                        currency: 'AED',
                        maximumFractionDigits: 0
                      }).format(program.tuitionFee)
                    : "Not specified"}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                * Additional fees may apply for registration, books, and facilities. Please contact the university for a comprehensive fee structure.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}