import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookmarkIcon, ShareIcon } from "lucide-react";
import ProgramDetailTabs from "@/polymet/components/program-detail-tabs";
import { PROGRAMS_DATA } from "@/polymet/data/programs-data";
import { UNIVERSITIES_DATA } from "@/polymet/data/universities-data";

export default function ProgramDetailPage() {
  // Get program ID from URL and provide a default
  const { id = "1" } = useParams();
  const programId = parseInt(id);

  // Find program and university data
  const program =
    PROGRAMS_DATA.find((p) => p.id === programId) || PROGRAMS_DATA[0];
  const university = UNIVERSITIES_DATA.find((u) => u.id === program.university);

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-8">
        {/* Header section */}
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {university?.logo && (
                <img
                  src={university.logo}
                  alt={university?.name}
                  className="h-12 w-auto object-contain"
                />
              )}
              <h2 className="text-lg font-medium">{university?.name}</h2>
            </div>
            <h1 className="text-3xl font-bold">{program.name}</h1>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span>{program.degreeLevel}</span>
              <span>•</span>
              <span>{program.duration}</span>
              <span>•</span>
              <span>{program.language}</span>
              {program.scholarship && (
                <>
                  <span>•</span>
                  <span className="text-green-600 font-medium">
                    Scholarship Available
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="gap-2">
              <BookmarkIcon className="h-4 w-4" />
              Save Program
            </Button>
            <Button variant="outline" className="gap-2">
              <ShareIcon className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ProgramDetailTabs program={program} />
          </div>
          <div className="space-y-6">
            <div className="border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-medium">Application Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Intake Periods</span>
                  <span className="font-medium">
                    {program.intake.join(", ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tuition Fee</span>
                  <span className="font-medium">
                    AED {program.tuitionFee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Application Fee</span>
                  <span className="font-medium">AED 500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next Deadline</span>
                  <span className="font-medium">August 15, 2023</span>
                </div>
              </div>
              <Button className="w-full mt-2">Apply Now</Button>
            </div>

            <div className="border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-medium">Need Help?</h3>
              <p className="text-sm text-muted-foreground">
                Our education consultants are ready to guide you through the
                application process.
              </p>
              <Button variant="outline" className="w-full">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
