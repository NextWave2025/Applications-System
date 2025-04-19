"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  CheckIcon,
  FileTextIcon,
  GraduationCapIcon,
  InfoIcon,
} from "lucide-react";

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
  return (
    <Tabs defaultValue="overview" className={cn("w-full", className)}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <InfoIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
        <TabsTrigger value="requirements" className="flex items-center gap-2">
          <CheckIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Requirements</span>
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center gap-2">
          <FileTextIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Documents</span>
        </TabsTrigger>
        <TabsTrigger value="tuition" className="flex items-center gap-2">
          <GraduationCapIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Tuition</span>
        </TabsTrigger>
      </TabsList>
      <div className="mt-6 rounded-lg border p-6">
        <TabsContent value="overview" className="space-y-4">
          <h3 className="text-lg font-semibold">Program Overview</h3>
          <p>{program.description}</p>
        </TabsContent>
        <TabsContent value="requirements" className="space-y-4">
          <h3 className="text-lg font-semibold">Entry Requirements</h3>
          <ul className="list-inside list-disc space-y-2">
            {program.entryRequirements.map((requirement, index) => (
              <li key={index}>{requirement}</li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="documents" className="space-y-4">
          <h3 className="text-lg font-semibold">Required Documents</h3>
          <ul className="list-inside list-disc space-y-2">
            {program.documentsNeeded.map((document, index) => (
              <li key={index}>{document}</li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="tuition" className="space-y-4">
          <h3 className="text-lg font-semibold">Tuition & Fees</h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span>Tuition Fee (per year)</span>
              <span className="font-semibold">
                {program.tuitionFee.toLocaleString()} AED
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Application Fee</span>
              <span className="font-semibold">500 AED</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Registration Fee</span>
              <span className="font-semibold">1,500 AED</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Books & Materials (estimated)</span>
              <span className="font-semibold">3,000 AED</span>
            </div>
            <div className="flex justify-between pt-2 text-lg font-bold">
              <span>Total (First Year)</span>
              <span>
                {(program.tuitionFee + 500 + 1500 + 3000).toLocaleString()} AED
              </span>
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
