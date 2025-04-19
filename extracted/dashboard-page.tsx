import { Link } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import StatsCards from "@/polymet/components/stats-cards";
import WelcomeBanner from "@/polymet/components/welcome-banner";

export default function DashboardPage() {
  // Mock data for the dashboard
  const stats = {
    totalStudents: 124,
    activeApplications: 45,
    approvedApplications: 78,
    totalCommission: 156000,
  };

  const recentApplications = [
    {
      id: 1,
      studentName: "Ahmed Ali",
      program: "MBA in Business Analytics",
      university: "University of Dubai",
      status: "Under Review",
      date: "2023-06-15",
    },
    {
      id: 2,
      studentName: "Sara Khan",
      program: "Bachelor of Computer Science",
      university: "American University of Sharjah",
      status: "Approved",
      date: "2023-06-12",
    },
    {
      id: 3,
      studentName: "Mohammed Hassan",
      program: "Master of Architecture",
      university: "Abu Dhabi University",
      status: "Pending Documents",
      date: "2023-06-10",
    },
    {
      id: 4,
      studentName: "Fatima Al Mansouri",
      program: "Bachelor of Medicine",
      university: "UAE University",
      status: "Interview Scheduled",
      date: "2023-06-08",
    },
  ];

  const popularPrograms = [
    {
      id: 1,
      name: "Bachelor of Business Administration",
      university: "University of Dubai",
      applications: 45,
      commission: 4500,
    },
    {
      id: 2,
      name: "Master of Computer Science",
      university: "Khalifa University",
      applications: 32,
      commission: 6400,
    },
    {
      id: 3,
      name: "Bachelor of Architecture",
      university: "American University of Sharjah",
      applications: 28,
      commission: 2800,
    },
    {
      id: 4,
      name: "MBA in Healthcare Management",
      university: "Abu Dhabi University",
      applications: 24,
      commission: 4800,
    },
  ];

  return (
    <div className="space-y-6">
      <WelcomeBanner userName="Sarah Ahmed" />

      <StatsCards stats={stats} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link
                to="/dashboard/applications"
                className="flex items-center gap-1"
              >
                View all
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{application.studentName}</p>
                    <p className="text-sm text-gray-500">
                      {application.program} • {application.university}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        application.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : application.status === "Under Review"
                            ? "bg-blue-100 text-blue-800"
                            : application.status === "Pending Documents"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {application.status}
                    </span>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(application.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Commission Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Commission Summary</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link
                to="/dashboard/commissions"
                className="flex items-center gap-1"
              >
                View all
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="monthly" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>
              <TabsContent value="monthly" className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Commission (June)
                    </p>
                    <p className="text-2xl font-bold">AED 24,500</p>
                  </div>
                  <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    +12% from last month
                  </div>
                </div>
                <div className="h-[1px] bg-gray-200"></div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Pending Payout</p>
                  <div className="flex items-center justify-between">
                    <p>AED 18,200</p>
                    <p className="text-sm text-gray-500">
                      Expected: July 15, 2023
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="quarterly" className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Commission (Q2 2023)
                    </p>
                    <p className="text-2xl font-bold">AED 68,900</p>
                  </div>
                  <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    +8% from Q1
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="yearly" className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Commission (2023)
                    </p>
                    <p className="text-2xl font-bold">AED 156,000</p>
                  </div>
                  <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    Projected: AED 312,000
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Popular Programs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Popular Programs</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/programs" className="flex items-center gap-1">
              View all programs
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-2 font-medium">Program</th>
                  <th className="pb-2 font-medium">University</th>
                  <th className="pb-2 font-medium text-right">Applications</th>
                  <th className="pb-2 font-medium text-right">Commission</th>
                </tr>
              </thead>
              <tbody>
                {popularPrograms.map((program) => (
                  <tr key={program.id} className="border-b last:border-0">
                    <td className="py-3">
                      <Link
                        to={`/programs/${program.id}`}
                        className="font-medium hover:underline"
                      >
                        {program.name}
                      </Link>
                    </td>
                    <td className="py-3 text-gray-500">{program.university}</td>
                    <td className="py-3 text-right">{program.applications}</td>
                    <td className="py-3 text-right font-medium">
                      AED {program.commission.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
