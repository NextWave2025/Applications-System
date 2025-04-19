"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { FilterIcon } from "lucide-react";

interface ProgramFiltersProps {
  className?: string;
  onFiltersChange?: (filters: any) => void;
}

export default function ProgramFilters({
  className,
  onFiltersChange,
}: ProgramFiltersProps) {
  const [tuitionRange, setTuitionRange] = useState([0, 200000]);
  const [degreeLevel, setDegreeLevel] = useState<string[]>([]);
  const [duration, setDuration] = useState<string[]>([]);
  const [intake, setIntake] = useState<string[]>([]);
  const [language, setLanguage] = useState<string[]>([]);
  const [scholarship, setScholarship] = useState<boolean | null>(null);

  const handleDegreeChange = (value: string, checked: boolean) => {
    setDegreeLevel((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const handleDurationChange = (value: string, checked: boolean) => {
    setDuration((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const handleIntakeChange = (value: string, checked: boolean) => {
    setIntake((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const handleLanguageChange = (value: string, checked: boolean) => {
    setLanguage((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const handleScholarshipChange = (value: string) => {
    if (value === "all") {
      setScholarship(null);
    } else if (value === "yes") {
      setScholarship(true);
    } else {
      setScholarship(false);
    }
  };

  const handleApplyFilters = () => {
    if (onFiltersChange) {
      onFiltersChange({
        tuitionRange,
        degreeLevel,
        duration,
        intake,
        language,
        scholarship,
      });
    }
  };

  const handleResetFilters = () => {
    setTuitionRange([0, 200000]);
    setDegreeLevel([]);
    setDuration([]);
    setIntake([]);
    setLanguage([]);
    setScholarship(null);

    if (onFiltersChange) {
      onFiltersChange({
        tuitionRange: [0, 200000],
        degreeLevel: [],
        duration: [],
        intake: [],
        language: [],
        scholarship: null,
      });
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <FilterIcon className="mr-2 h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label className="mb-2 inline-block">Tuition Fee (AED)</Label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {tuitionRange[0].toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">
                {tuitionRange[1].toLocaleString()}
              </span>
            </div>
            <Slider
              defaultValue={tuitionRange}
              min={0}
              max={200000}
              step={5000}
              value={tuitionRange}
              onValueChange={setTuitionRange}
              className="my-2"
            />
          </div>

          <div className="space-y-2">
            <Label className="mb-1 inline-block">Degree Level</Label>
            <div className="space-y-2">
              {["Foundation", "Bachelor", "Master", "PhD"].map(
                (level, index) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={`degree-${level}`}
                      checked={degreeLevel.includes(level)}
                      onCheckedChange={(checked) =>
                        handleDegreeChange(level, checked as boolean)
                      }
                    />

                    <Label
                      htmlFor={`degree-${level}`}
                      className="text-sm font-normal"
                    >
                      {level}
                    </Label>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="mb-1 inline-block">Duration</Label>
            <div className="space-y-2">
              {["1 year", "2-3 years", "4+ years"].map((period, index) => (
                <div key={period} className="flex items-center space-x-2">
                  <Checkbox
                    id={`duration-${period}`}
                    checked={duration.includes(period)}
                    onCheckedChange={(checked) =>
                      handleDurationChange(period, checked as boolean)
                    }
                  />

                  <Label
                    htmlFor={`duration-${period}`}
                    className="text-sm font-normal"
                  >
                    {period}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="mb-1 inline-block">Intake</Label>
            <div className="space-y-2">
              {["January", "May", "September"].map((month, index) => (
                <div key={month} className="flex items-center space-x-2">
                  <Checkbox
                    id={`intake-${month}`}
                    checked={intake.includes(month)}
                    onCheckedChange={(checked) =>
                      handleIntakeChange(month, checked as boolean)
                    }
                  />

                  <Label
                    htmlFor={`intake-${month}`}
                    className="text-sm font-normal"
                  >
                    {month}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="mb-1 inline-block">Language</Label>
            <div className="space-y-2">
              {["English", "Arabic"].map((lang, index) => (
                <div key={lang} className="flex items-center space-x-2">
                  <Checkbox
                    id={`language-${lang}`}
                    checked={language.includes(lang)}
                    onCheckedChange={(checked) =>
                      handleLanguageChange(lang, checked as boolean)
                    }
                  />

                  <Label
                    htmlFor={`language-${lang}`}
                    className="text-sm font-normal"
                  >
                    {lang}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scholarship" className="mb-1 inline-block">
              Scholarships
            </Label>
            <Select
              value={
                scholarship === null
                  ? "all"
                  : scholarship === true
                    ? "yes"
                    : "no"
              }
              onValueChange={handleScholarshipChange}
            >
              <SelectTrigger id="scholarship">
                <SelectValue placeholder="All options" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All options</SelectItem>
                <SelectItem value="yes">Scholarship available</SelectItem>
                <SelectItem value="no">No scholarship</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
          <Button variant="outline" onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
