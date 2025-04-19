import {
  BookmarkIcon,
  FileTextIcon,
  CheckCircleIcon,
  ClockIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StudentStatsCardsProps {
  stats: {
    savedPrograms: number;
    activeApplications: number;
    completedApplications: number;
    upcomingDeadlines: number;
  };
  className?: string;
}

export default function StudentStatsCards({
  stats,
  className,
}: StudentStatsCardsProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saved Programs</CardTitle>
          <BookmarkIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.savedPrograms}</div>
          <p className="text-xs text-muted-foreground">Bookmarked for later</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Applications
          </CardTitle>
          <FileTextIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeApplications}</div>
          <p className="text-xs text-muted-foreground">
            In progress or under review
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Completed Applications
          </CardTitle>
          <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.completedApplications}
          </div>
          <p className="text-xs text-muted-foreground">Approved or rejected</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Upcoming Deadlines
          </CardTitle>
          <ClockIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingDeadlines}</div>
          <p className="text-xs text-muted-foreground">Within next 30 days</p>
        </CardContent>
      </Card>
    </div>
  );
}
