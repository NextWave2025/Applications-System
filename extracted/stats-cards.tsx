import {
  ArrowDownIcon,
  ArrowUpIcon,
  UsersIcon,
  FileTextIcon,
  CheckCircleIcon,
  DollarSignIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: {
    totalStudents: number;
    activeApplications: number;
    approvedApplications: number;
    totalCommission: number;
  };
  className?: string;
}

export default function StatsCards({ stats, className }: StatsCardsProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalStudents}</div>
          <p className="text-xs text-muted-foreground">
            <span className="flex items-center text-green-600">
              <ArrowUpIcon className="mr-1 h-3 w-3" />
              12%
            </span>{" "}
            from last month
          </p>
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
            <span className="flex items-center text-green-600">
              <ArrowUpIcon className="mr-1 h-3 w-3" />
              8%
            </span>{" "}
            from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Approved Applications
          </CardTitle>
          <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.approvedApplications}</div>
          <p className="text-xs text-muted-foreground">
            <span className="flex items-center text-amber-600">
              <ArrowDownIcon className="mr-1 h-3 w-3" />
              3%
            </span>{" "}
            from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Commission (AED)
          </CardTitle>
          <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalCommission.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="flex items-center text-green-600">
              <ArrowUpIcon className="mr-1 h-3 w-3" />
              18%
            </span>{" "}
            from last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
