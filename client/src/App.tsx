import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client";
import { AuthProvider } from "./hooks/use-auth";
import { Toaster } from "./components/ui/toaster";

import LandingPage from "./pages/landing-page";
import ProgramsPage from "./pages/programs-page";
import ProgramDetailPage from "./pages/program-detail-page";
import ApplicationFormPage from "./pages/application-form-page";
import ApplicationEditPage from "./pages/application-edit-page";
import ApplicationsPage from "./pages/applications-page";
import AuthPage from "./pages/auth-page";
import DashboardPage from "./pages/dashboard-page";
import AdminDashboardPage from "./pages/admin-dashboard-page";
import SettingsPage from "./pages/settings-page";
import AboutPage from "./pages/about-page";
import ContactPage from "./pages/contact-page";
import NotFoundPage from "./pages/not-found";

import MainLayout from "./layouts/main-layout";
import DashboardLayout from "./layouts/dashboard-layout";
import { ProtectedRoute } from "./components/protected-route";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
              path="/auth"
              element={
                <MainLayout>
                  <AuthPage />
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

            <Route
              path="/about"
              element={
                <MainLayout>
                  <AboutPage />
                </MainLayout>
              }
            />

            <Route
              path="/contact"
              element={
                <MainLayout>
                  <ContactPage />
                </MainLayout>
              }
            />

            {/* Protected routes with DashboardLayout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DashboardPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/programs"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ProgramsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/applications"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ApplicationsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SettingsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin dashboard route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Application form route */}
            <Route
              path="/apply/:id"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ApplicationFormPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Application edit route */}
            <Route
              path="/dashboard/applications/:id/edit"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ApplicationEditPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            
            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}