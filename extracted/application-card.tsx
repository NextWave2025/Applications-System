import { Link } from "react-router-dom";
import { CalendarIcon, ClockIcon, GraduationCapIcon } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ApplicationStatusBadge from "@/polymet/components/application-status-badge";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under-review"
  | "approved"
  | "rejected"
  | "incomplete";

interface ApplicationCardProps {
  application: {
    id: number;
    programName: string;
    universityName: string;
    universityLogo?: string;
    degreeLevel: string;
    intake: string;
    submissionDate?: string;
    status: ApplicationStatus;
  };
  className?: string;
}

export default function ApplicationCard({
  application,
  className,
}: ApplicationCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {application.universityLogo && (
              <img
                src={application.universityLogo}
                alt={application.universityName}
                className="h-10 w-10 object-contain"
              />
            )}
            <div>
              <h3 className="font-medium">{application.programName}</h3>
              <p className="text-sm text-muted-foreground">
                {application.universityName}
              </p>
            </div>
          </div>
          <ApplicationStatusBadge status={application.status} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <GraduationCapIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{application.degreeLevel}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Intake: {application.intake}</span>
          </div>
          {application.submissionDate && (
            <div className="flex items-center space-x-2 col-span-2">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Submitted: {application.submissionDate}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button asChild variant="outline" size="sm">
          <Link to={`/student/applications/${application.id}`}>
            View Details
          </Link>
        </Button>

        {application.status === "draft" && (
          <Button asChild size="sm">
            <Link to={`/student/applications/${application.id}/edit`}>
              Continue
            </Link>
          </Button>
        )}

        {application.status === "incomplete" && (
          <Button asChild size="sm">
            <Link to={`/student/applications/${application.id}/edit`}>
              Complete
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
