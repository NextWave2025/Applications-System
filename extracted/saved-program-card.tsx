import { Link } from "react-router-dom";
import {
  BookmarkIcon,
  CalendarIcon,
  ClockIcon,
  GraduationCapIcon,
  Pencil,
  TrashIcon,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface SavedProgramCardProps {
  className?: string;
  program: {
    id: number;
    programId: number;
    programName: string;
    universityName: string;
    universityLogo?: string;
    degreeLevel: string;
    duration: string;
    tuitionFee: number;
    intake: string[];
    scholarship: boolean;
    dateAdded: string;
    notes?: string;
    deadlineDate?: string;
  };
  onRemove?: (id: number) => void;
  onUpdateNotes?: (id: number, notes: string) => void;
}

export default function SavedProgramCard({
  className,
  program,
  onRemove,
  onUpdateNotes,
}: SavedProgramCardProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(program.notes || "");

  const handleSaveNotes = () => {
    if (onUpdateNotes) {
      onUpdateNotes(program.id, notes);
    }
    setIsEditingNotes(false);
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(program.id);
    }
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {program.universityLogo && (
              <img
                src={program.universityLogo}
                alt={program.universityName}
                className="h-8 w-8 object-contain"
              />
            )}
            <CardDescription>{program.universityName}</CardDescription>
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
        <CardTitle className="line-clamp-2 text-lg">
          {program.programName}
        </CardTitle>
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

        {program.deadlineDate && (
          <div className="mt-3 flex items-center">
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-800 border-amber-200"
            >
              <ClockIcon className="mr-1 h-3 w-3" />
              Deadline: {program.deadlineDate}
            </Badge>
          </div>
        )}

        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Notes</span>
            {!isEditingNotes && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsEditingNotes(true)}
              >
                <Pencil className="h-3 w-3" />
                <span className="sr-only">Edit notes</span>
              </Button>
            )}
          </div>

          {isEditingNotes ? (
            <div className="space-y-2">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this program..."
                className="min-h-[80px] text-sm"
              />

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNotes(program.notes || "");
                    setIsEditingNotes(false);
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveNotes}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground min-h-[40px]">
              {program.notes || "No notes added yet."}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button asChild variant="default" size="sm">
          <Link to={`/student/applications/new?programId=${program.programId}`}>
            Start Application
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <TrashIcon className="h-4 w-4 mr-1" />
          Remove
        </Button>
      </CardFooter>
    </Card>
  );
}
