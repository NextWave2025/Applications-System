import { Router, Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { CurrencyProvider } from "./hooks/use-currency";
import { Toaster } from "./components/ui/toaster";
import { useEffect } from "react";

import LandingPage from "./pages/landing-page";
import ProgramsPage from "./pages/programs-page";
import ProgramDetailPage from "./pages/program-detail-page";
import ApplicationFormPage from "./pages/application-form-page";
import ApplicationEditPage from "./pages/application-edit-page";
import ApplicationsPage from "./pages/applications-page";
import AuthPage from "./pages/auth-page";
import DashboardPage from "./pages/dashboard-page";
import AdminDashboardPage from "./pages/admin-dashboard-simple";
import AdminControlPage from "./pages/admin-control-page";
import AdminMyApplicationsPage from "./pages/admin-my-applications-page";
import SettingsPage from "./pages/settings-page";
import AboutPage from "./pages/about-page";
import ContactPage from "./pages/contact-page";
import EmailTestPage from "./pages/email-test-page";
import NotFoundPage from "./pages/not-found";

import MainLayout from "./layouts/main-layout";
import DashboardLayout from "./layouts/dashboard-layout";
import AdminLayout from "./layouts/admin-layout";
import ProtectedRoute from "./components/protected-route";
import ApplicationDetailsPage from "./pages/application-details-page";
import UserApplicationDetailsPage from "./pages/user-application-details-page";

export default function App() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      console.error("Stack:", event.reason?.stack);
      console.error("Promise:", event.promise);
      // Don't prevent default to see the full error in browser
    };

    const handleError = (event: ErrorEvent) => {
      console.error("Global error:", event.error);
      console.error("Error details:", event.message, "at", event.filename, ":", event.lineno);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <AuthProvider>
          <Router>
            <Switch>
              {/* Public routes with MainLayout */}
              <Route path="/">
                <MainLayout>
                  <LandingPage />
                </MainLayout>
              </Route>

              <Route path="/auth">
                <MainLayout>
                  <AuthPage />
                </MainLayout>
              </Route>

              <Route path="/programs/:id">
                <MainLayout>
                  <ProgramDetailPage />
                </MainLayout>
              </Route>

              <Route path="/programs">
                <MainLayout>
                  <ProgramsPage />
                </MainLayout>
              </Route>

              <Route path="/about">
              <MainLayout>
                <AboutPage />
              </MainLayout>
            </Route>

              <Route path="/contact">
              <MainLayout>
                <ContactPage />
              </MainLayout>
            </Route>

            {/* Admin routes - These must come BEFORE dashboard routes to avoid conflicts */}
              <Route path="/admin/applications/:id">
              <ProtectedRoute>
                <AdminLayout>
                  <ApplicationDetailsPage />
                </AdminLayout>
              </ProtectedRoute>
            </Route>

              <Route path="/admin/my-applications">
              <ProtectedRoute>
                <AdminLayout>
                  <AdminMyApplicationsPage />
                </AdminLayout>
              </ProtectedRoute>
            </Route>

              <Route path="/admin/control">
              <ProtectedRoute>
                <AdminLayout>
                  <AdminControlPage />
                </AdminLayout>
              </ProtectedRoute>
            </Route>

              <Route path="/admin/dashboard">
              <ProtectedRoute>
                <AdminLayout>
                  <AdminDashboardPage />
                </AdminLayout>
              </ProtectedRoute>
            </Route>

              <Route path="/admin">
              <ProtectedRoute>
                <AdminLayout>
                  <AdminDashboardPage />
                </AdminLayout>
              </ProtectedRoute>
            </Route>

            {/* Protected routes with DashboardLayout */}
              <Route path="/dashboard/applications/:id/edit">
              <ProtectedRoute>
                <DashboardLayout>
                  <ApplicationEditPage />
                </DashboardLayout>
              </ProtectedRoute>
            </Route>

              <Route path="/dashboard/applications/:id">
              <ProtectedRoute>
                <DashboardLayout>
                  <UserApplicationDetailsPage />
                </DashboardLayout>
              </ProtectedRoute>
            </Route>

              <Route path="/dashboard/applications">
              <ProtectedRoute>
                <DashboardLayout>
                  <ApplicationsPage />
                </DashboardLayout>
              </ProtectedRoute>
            </Route>

              <Route path="/dashboard/programs">
              <ProtectedRoute>
                <DashboardLayout>
                  <ProgramsPage />
                </DashboardLayout>
              </ProtectedRoute>
            </Route>

              <Route path="/dashboard/settings">
              <ProtectedRoute>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            </Route>

              <Route path="/dashboard">
              <ProtectedRoute redirectTo="/dashboard">
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            </Route>

              <Route path="/email-test">
              <MainLayout>
                <EmailTestPage />
              </MainLayout>
            </Route>

            {/* Application form route */}
              <Route path="/apply/:id">
              <ProtectedRoute>
                <MainLayout>
                  <ApplicationFormPage />
                </MainLayout>
              </ProtectedRoute>
            </Route>

            {/* 404 route - must be last */}
              <Route>
              <NotFoundPage />
            </Route>
          </Switch>
          </Router>
          <Toaster />
        </AuthProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  );
}