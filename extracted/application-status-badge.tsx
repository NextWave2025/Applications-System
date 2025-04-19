import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under-review"
  | "approved"
  | "rejected"
  | "incomplete";

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export default function ApplicationStatusBadge({
  status,
  className,
}: ApplicationStatusBadgeProps) {
  const getStatusConfig = (status: ApplicationStatus) => {
    switch (status) {
      case "draft":
        return {
          label: "Draft",
          className:
            "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-800",
        };
      case "submitted":
        return {
          label: "Submitted",
          className:
            "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-900",
        };
      case "under-review":
        return {
          label: "Under Review",
          className:
            "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-300 dark:hover:bg-amber-900",
        };
      case "approved":
        return {
          label: "Approved",
          className:
            "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-900",
        };
      case "rejected":
        return {
          label: "Rejected",
          className:
            "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-900",
        };
      case "incomplete":
        return {
          label: "Incomplete",
          className:
            "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-300 dark:hover:bg-orange-900",
        };
      default:
        return {
          label: "Unknown",
          className:
            "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-800",
        };
    }
  };

  const { label, className: statusClassName } = getStatusConfig(status);

  return (
    <Badge variant="outline" className={cn(statusClassName, className)}>
      {label}
    </Badge>
  );
}
