import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  BookmarkIcon,
  CalendarIcon,
  ClockIcon,
  GraduationCapIcon,
} from "lucide-react";

interface ProgramCardProps {
  className?: string;
  program: {
    id: number;
    name: string;
    university: number;
    universityName?: string;
    universityLogo?: string;
    degreeLevel: string;
    duration: string;
    tuitionFee: number;
    intake: string[];
    scholarship: boolean;
  };
}

export default function ProgramCard({ className, program }: ProgramCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {program.universityLogo && (
              <img
                src={program.universityLogo}
                alt={program.universityName || "University logo"}
                className="h-8 w-8 object-contain"
              />
            )}
            <CardDescription>
              {program.universityName || "University"}
            </CardDescription>
          </div>
          <Badge
            variant={program.scholarship ? "default" : "outline"}
            className={
              program.scholarship
                ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-900"
                : ""
            }
          >
            {program.scholarship ? "Scholarship Available" : "No Scholarship"}
          </Badge>
        </div>
        <CardTitle className="line-clamp-2 text-lg">{program.name}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <GraduationCapIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{program.degreeLevel}</span>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{program.duration}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{program.intake.join(", ")}</span>
          </div>
          <div className="font-medium text-primary">
            {program.tuitionFee.toLocaleString()} AED/yr
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button asChild variant="outline" size="sm">
          <Link to={`/programs/${program.id}`}>View Details</Link>
        </Button>
        <Button variant="ghost" size="icon">
          <BookmarkIcon className="h-4 w-4" />
          <span className="sr-only">Bookmark</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
