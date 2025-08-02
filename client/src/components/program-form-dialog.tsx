
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/query-client";
import { X } from "lucide-react";

interface University {
  id: number;
  name: string;
  location: string;
  imageUrl: string;
}

interface Program {
  id: number;
  name: string;
  universityId: number;
  tuition: string;
  duration: string;
  intake: string;
  degree: string;
  studyField: string;
  requirements: string[];
  hasScholarship: boolean;
  imageUrl: string;
}

interface ProgramFormDialogProps {
  program?: Program | null;
  universities: University[];
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const degreeOptions = [
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Diploma",
  "Certificate"
];

const studyFieldOptions = [
  "Business & Management",
  "Engineering",
  "Computer Science & IT",
  "Medicine & Health",
  "Arts & Humanities",
  "Social Sciences",
  "Natural Sciences",
  "Law",
  "Education",
  "Architecture & Design"
];

const durationOptions = [
  "1 year",
  "2 years",
  "3 years",
  "4 years",
  "4+ years"
];

export default function ProgramFormDialog({
  program,
  universities,
  isOpen,
  onClose,
  onSave,
}: ProgramFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    universityId: "",
    tuition: "",
    duration: "",
    intake: "",
    degree: "",
    studyField: "",
    requirements: [] as string[],
    hasScholarship: false,
    imageUrl: "",
  });
  const [newRequirement, setNewRequirement] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (program) {
      setFormData({
        name: program.name,
        universityId: program.universityId.toString(),
        tuition: program.tuition,
        duration: program.duration,
        intake: program.intake,
        degree: program.degree,
        studyField: program.studyField,
        requirements: program.requirements || [],
        hasScholarship: program.hasScholarship,
        imageUrl: program.imageUrl,
      });
    } else {
      setFormData({
        name: "",
        universityId: "",
        tuition: "",
        duration: "",
        intake: "",
        degree: "",
        studyField: "",
        requirements: [],
        hasScholarship: false,
        imageUrl: "",
      });
    }
  }, [program, isOpen]);

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, newRequirement.trim()],
      });
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        universityId: parseInt(formData.universityId),
      };

      if (program) {
        // Update existing program
        await apiRequest("PUT", `/api/admin/programs/${program.id}`, submitData);
      } else {
        // Create new program
        await apiRequest("POST", "/api/admin/programs", submitData);
      }
      onSave();
    } catch (err) {
      console.error("Error saving program:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {program ? "Edit Program" : "Add New Program"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Program Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Select
                value={formData.universityId}
                onValueChange={(value) =>
                  setFormData({ ...formData, universityId: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((university) => (
                    <SelectItem key={university.id} value={university.id.toString()}>
                      {university.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="degree">Degree Level</Label>
              <Select
                value={formData.degree}
                onValueChange={(value) =>
                  setFormData({ ...formData, degree: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select degree level" />
                </SelectTrigger>
                <SelectContent>
                  {degreeOptions.map((degree) => (
                    <SelectItem key={degree} value={degree}>
                      {degree}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="studyField">Study Field</Label>
              <Select
                value={formData.studyField}
                onValueChange={(value) =>
                  setFormData({ ...formData, studyField: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select study field" />
                </SelectTrigger>
                <SelectContent>
                  {studyFieldOptions.map((field) => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) =>
                  setFormData({ ...formData, duration: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((duration) => (
                    <SelectItem key={duration} value={duration}>
                      {duration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tuition">Tuition Fee</Label>
              <Input
                id="tuition"
                value={formData.tuition}
                onChange={(e) =>
                  setFormData({ ...formData, tuition: e.target.value })
                }
                placeholder="e.g., 45,000 AED/year"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="intake">Intake</Label>
              <Input
                id="intake"
                value={formData.intake}
                onChange={(e) =>
                  setFormData({ ...formData, intake: e.target.value })
                }
                placeholder="e.g., September"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Program Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Application Requirements</Label>
            <div className="flex gap-2">
              <Input
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Add a requirement"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <Button type="button" onClick={addRequirement}>
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                  <span>{requirement}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRequirement(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasScholarship"
              checked={formData.hasScholarship}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, hasScholarship: !!checked })
              }
            />
            <Label htmlFor="hasScholarship">Scholarship Available</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
