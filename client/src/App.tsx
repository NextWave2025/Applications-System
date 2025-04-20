import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "./lib/queryClient";

// Layouts
import DashboardLayout from "./layouts/dashboard-layout";
import MainLayout from "./layouts/main-layout";

// Pages
import DashboardPage from "./pages/dashboard-page";
import LandingPage from "./pages/landing-page";
import LoginPage from "./pages/login-page";
import ProgramDetailPage from "./pages/program-detail";
import ProgramsPage from "./pages/programs-page";
import SignupPage from "./pages/signup-page";
import NotFound from "./pages/not-found";

function DataInitializer() {
  const { toast } = useToast();

  useEffect(() => {
    const initializeData = async () => {
      try {
        await apiRequest("GET", "/api/initialize", undefined);
      } catch (error) {
        console.error("Failed to initialize data:", error);
        toast({
          title: "Error",
          description: "Failed to load program data. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    initializeData();
  }, [toast]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DataInitializer />
        <Toaster />
        <Router>
          <Routes>
            {/* Public routes with MainLayout */}
            <Route
              path="/"
              element={
                <MainLayout>
                  <LandingPage />
                </MainLayout>
              }
            />

            <Route
              path="/login"
              element={
                <MainLayout>
                  <LoginPage />
                </MainLayout>
              }
            />

            <Route
              path="/signup"
              element={
                <MainLayout>
                  <SignupPage />
                </MainLayout>
              }
            />

            <Route
              path="/programs"
              element={
                <MainLayout>
                  <ProgramsPage />
                </MainLayout>
              }
            />

            <Route
              path="/programs/:id"
              element={
                <MainLayout>
                  <ProgramDetailPage />
                </MainLayout>
              }
            />

            {/* Dashboard routes with DashboardLayout */}
            <Route
              path="/dashboard"
              element={
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              }
            />

            {/* Add routes for dashboard sections */}
            <Route
              path="/dashboard/programs"
              element={
                <DashboardLayout>
                  <ProgramsPage />
                </DashboardLayout>
              }
            />

            <Route
              path="/dashboard/applications"
              element={
                <DashboardLayout>
                  <div className="p-4">Applications Page (Coming Soon)</div>
                </DashboardLayout>
              }
            />

            <Route
              path="/dashboard/commissions"
              element={
                <DashboardLayout>
                  <div className="p-4">Commissions Page (Coming Soon)</div>
                </DashboardLayout>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
