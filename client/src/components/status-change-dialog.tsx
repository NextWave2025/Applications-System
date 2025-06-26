import { useState, useEffect } from "react";
import { format } from "date-fns";
import { AlertCircle, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { applicationStatuses, adminControlledStatuses } from "@shared/schema";

interface Application {
  id: number;
  studentFirstName: string;
  studentLastName: string;
  status: string;
  program: {
    name: string;
    universityName?: string;
    degreeLevel?: string;
    university?: {
      name: string;
      city: string;
    };
  };
  statusHistory?: Array<{
    fromStatus: string;
    toStatus: string;
    timestamp: string;
    userId: number;
    notes: string;
  }>;
}

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
  onStatusChanged: () => void;
}

export default function StatusChangeDialog({
  open,
  onOpenChange,
  application,
  onStatusChanged
}: StatusChangeDialogProps) {
  const { toast } = useToast();
  const [newStatus, setNewStatus] = useState(application?.status || "");
  const [statusNotes, setStatusNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [conditionalOfferTerms, setConditionalOfferTerms] = useState("");
  const [paymentConfirmation, setPaymentConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens with a new application
  // Using useEffect for state updates to avoid React warnings
  // about setting state during render
  useEffect(() => {
    if (application && open) {
      setNewStatus(application.status);
      setStatusNotes("");
      setRejectionReason("");
      setConditionalOfferTerms("");
      setPaymentConfirmation(false);
    }
  }, [application, open]);

  const updateApplicationStatus = async () => {
    if (!application || !newStatus) return;
    
    try {
      setLoading(true);
      
      // Prepare the request body based on the selected status
      const requestBody: any = {
        status: newStatus,
        notes: statusNotes
      };
      
      // Add conditional fields based on status
      if (newStatus === "rejected") {
        requestBody.rejectionReason = rejectionReason;
      } else if (newStatus === "accepted-conditional-offer") {
        requestBody.conditionalOfferTerms = conditionalOfferTerms;
      } else if (newStatus === "payment-clearing") {
        requestBody.paymentConfirmation = paymentConfirmation;
      }
      
      // Make the API request
      await apiRequest(
        "PATCH", 
        `/api/admin/applications/${application.id}/status`, 
        requestBody
      );
      
      // Show success toast
      toast({
        title: "Status updated successfully",
        description: `Application status changed to ${newStatus.replace('-', ' ')}`,
      });
      
      // Close the dialog
      onOpenChange(false);
      
      // Notify parent component that status was changed
      onStatusChanged();
    } catch (err) {
      console.error("Error updating application status:", err);
      
      // Show error toast
      toast({
        title: "Failed to update status",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change Application Status</DialogTitle>
          <DialogDescription>
            Update the status of this application. Additional fields may be required based on the selected status.
          </DialogDescription>
        </DialogHeader>
        
        {application && (
          <div className="py-4">
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Application Details</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm bg-muted/30 p-3 rounded-md">
                <div>
                  <span className="text-muted-foreground">Student:</span>
                  <p className="font-medium">{application.studentFirstName} {application.studentLastName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Program:</span>
                  <p className="font-medium">{application.program.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">University:</span>
                  <p className="font-medium">{application.program.universityName || application.program.university?.name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Current Status:</span>
                  <p className="font-medium">{application.status.replace('-', ' ')}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="status">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Display all available statuses from the schema */}
                    {applicationStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace(/-/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Status Change Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about this status change"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                />
              </div>
              
              {/* Conditional fields based on status */}
              {newStatus === "rejected" && (
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason" className="text-destructive">Rejection Reason</Label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="Specify the reason for rejection"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="border-destructive"
                  />
                </div>
              )}
              
              {newStatus === "accepted-conditional-offer" && (
                <div className="space-y-2">
                  <Label htmlFor="conditionalOfferTerms">Conditional Offer Terms</Label>
                  <Textarea
                    id="conditionalOfferTerms"
                    placeholder="Specify the conditions that must be met"
                    value={conditionalOfferTerms}
                    onChange={(e) => setConditionalOfferTerms(e.target.value)}
                  />
                </div>
              )}
              
              {newStatus === "payment-clearing" && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="paymentConfirmation"
                    checked={paymentConfirmation}
                    onChange={(e) => setPaymentConfirmation(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="paymentConfirmation">Payment has been confirmed</Label>
                </div>
              )}
              
              {/* Status history preview */}
              {application.statusHistory && application.statusHistory.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium">Status History</h4>
                  </div>
                  <div className="max-h-32 overflow-y-auto bg-muted/30 p-2 rounded-md text-sm">
                    {application.statusHistory.map((history, index) => (
                      <div key={index} className="mb-2 pb-2 border-b border-border last:border-0">
                        <div className="flex justify-between">
                          <span>
                            <span className="font-medium">{history.fromStatus.replace('-', ' ')}</span>
                            {' → '}
                            <span className="font-medium">{history.toStatus.replace('-', ' ')}</span>
                          </span>
                          <span className="text-muted-foreground">{format(new Date(history.timestamp), 'MMM d, yyyy')}</span>
                        </div>
                        {history.notes && <p className="text-muted-foreground mt-1">{history.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={updateApplicationStatus}
            disabled={loading || !newStatus || newStatus === application?.status}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}