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
  program,
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
            <h3 className="text-lg font-semibold text-gray-900">
              Program Overview
            </h3>
            <div className="text-gray-600 prose max-w-none">
              {typeof program.description === "string" ? (
                <p>{program.description}</p>
              ) : (
                <p>
                  No description available for this program. Please contact
                  support for assistance
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "requirements" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Entry Requirements
            </h3>
            {Array.isArray(program.entryRequirements) &&
            program.entryRequirements.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                {program.entryRequirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-600">
                <p>
                  Entry requirements information is not available for this
                  program.
                </p>
                <p className="mt-2">Typical requirements may include:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>High school diploma or equivalent</li>
                  <li>Minimum GPA requirements</li>
                  <li>English language proficiency</li>
                  <li>Entrance examinations (if applicable)</li>
                </ul>
                <p className="mt-3 text-sm">
                  Please contact support for assistance with verifying your
                  entry requirements.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Required Documents
            </h3>
            {Array.isArray(program.documentsNeeded) &&
            program.documentsNeeded.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                {program.documentsNeeded.map((document, index) => (
                  <li key={index}>{document}</li>
                ))}
              </ul>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-600">
                <p>
                  Required documents information is not available for this
                  program.
                </p>
                <p className="mt-2">
                  Common documents typically required include:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Academic transcripts</li>
                  <li>Copy of passport</li>
                  <li>English language test results (IELTS/TOEFL)</li>
                  <li>Personal statement or statement of purpose</li>
                  <li>Letters of recommendation</li>
                  <li>CV/Resume</li>
                </ul>
                <p className="mt-3 text-sm">
                  Please contact the university admissions office for a complete
                  list of required documents.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "fees" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Tuition & Fees
            </h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">
                    Tuition Fee (Full Program)
                  </span>
                  <span className="font-semibold text-lg">
                    {program.tuitionFee
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "AED",
                          maximumFractionDigits: 0,
                        }).format(program.tuitionFee)
                      : "Not specified"}
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: "75%" }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Compared to similar programs</span>
                  <span>25% less expensive</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Application Fee</span>
                  <span>AED 500</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Registration Fee</span>
                  <span>AED 1,500</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Books & Materials (estimated)
                  </span>
                  <span>AED 3,000 / year</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">
                  * The fees shown are approximate and subject to change.
                  Additional fees may apply for student services, technology,
                  and facilities. Please contact the university for a
                  comprehensive and up-to-date fee structure.
                </p>
                <div className="mt-4 flex items-center justify-center">
                  <span className="inline-flex items-center text-sm font-medium text-primary">
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download Fee Structure
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
