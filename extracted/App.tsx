import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import DashboardLayout from "@/polymet/layouts/dashboard-layout";
import MainLayout from "@/polymet/layouts/main-layout";
import DashboardPage from "@/polymet/pages/dashboard-page";
import LandingPage from "@/polymet/pages/landing-page";
import LoginPage from "@/polymet/pages/login-page";
import ProgramDetailPage from "@/polymet/pages/program-detail-page";
import ProgramsPage from "@/polymet/pages/programs-page";
import SignupPage from "@/polymet/pages/signup-page";

export default function MainPrototype() {
  return (
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
      </Routes>
    </Router>
  );
}
