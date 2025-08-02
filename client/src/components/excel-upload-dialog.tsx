import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/query-client";

interface ExcelUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExcelUploadDialog({ isOpen, onClose, onSuccess }: ExcelUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("excel", selectedFile);

      // Use fetch directly for file upload to avoid JSON parsing issues
      const response = await fetch("/api/admin/upload-excel", {
        method: "POST",
        body: formData,
        credentials: "include", // Important for authentication
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const result = await response.json();
      console.log("Upload result:", result);
      
      alert(`File uploaded successfully! Created ${result.universitiesCreated} universities and ${result.programsCreated} programs.`);
      onSuccess(); // Refresh data
      onClose();
    } catch (error: any) {
      console.error("Error uploading file:", error);
      alert(`Upload failed: ${error.message || "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Excel File</DialogTitle>
          <DialogDescription>
            Upload an Excel file containing university and program data. The file should have "Universities" and "Programs" sheets.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input 
            type="file" 
            accept=".xlsx,.xls" 
            onChange={handleFileChange} 
          />
          {selectedFile && (
            <p className="text-sm text-gray-600">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleUpload} disabled={uploading || !selectedFile}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}