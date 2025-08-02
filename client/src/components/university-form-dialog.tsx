
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
import { apiRequest } from "@/lib/query-client";

interface University {
  id: number;
  name: string;
  location: string;
  imageUrl: string;
}

interface UniversityFormDialogProps {
  university?: University | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function UniversityFormDialog({
  university,
  isOpen,
  onClose,
  onSave,
}: UniversityFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (university) {
      setFormData({
        name: university.name,
        location: university.location,
        imageUrl: university.imageUrl,
      });
    } else {
      setFormData({
        name: "",
        location: "",
        imageUrl: "",
      });
    }
  }, [university, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (university) {
        // Update existing university
        await apiRequest("PUT", `/api/admin/universities/${university.id}`, formData);
      } else {
        // Create new university
        await apiRequest("POST", "/api/admin/universities", formData);
      }
      onSave();
    } catch (err) {
      console.error("Error saving university:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {university ? "Edit University" : "Add New University"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">University Name</Label>
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
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Logo URL</Label>
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
          {formData.imageUrl && (
            <div className="space-y-2">
              <Label>Logo Preview</Label>
              <img
                src={formData.imageUrl}
                alt="University logo preview"
                className="h-16 w-auto object-contain border rounded"
              />
            </div>
          )}
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
