import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/use-auth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { apiRequest } from "../lib/query-client";
import { Eye, EyeOff, Shield, Users, Settings, BookOpen, BarChart3, Globe } from "lucide-react";

export default function AdminAuthPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  // Use the working authentication from useAuth hook
  const { loginMutation: authLoginMutation } = useAuth();

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const userData = await authLoginMutation.mutateAsync({ username: data.email, password: data.password });
      return userData;
    },
    onSuccess: async (userData: any) => {
      console.log("Admin login success, user data:", userData);
      
      // Check if user role matches the login page
      if (userData && userData.role !== 'admin') {
        setError(`This account is registered as ${userData.role}. Please use the ${userData.role} login page or register a new admin account.`);
        return;
      }
      
      // Check if user is actually an admin
      if (userData && userData.role === 'admin') {
        console.log("Redirecting to admin dashboard");
        
        // Wait for auth state to propagate, then redirect
        setTimeout(() => {
          // Check for redirectAfterLogin from ProtectedRoute
          const redirectAfterLogin = localStorage.getItem("redirectAfterLogin");
          if (redirectAfterLogin) {
            localStorage.removeItem("redirectAfterLogin");
            setLocation(redirectAfterLogin);
            return;
          }
          
          // Default redirect to admin dashboard
          setLocation("/admin");
        }, 200);
      } else {
        setError("Access denied. Admin privileges required.");
      }
    },
    onError: (error: any) => {
      console.log("Admin login error:", error);
      setError(error.message || "Login failed");
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate(loginForm);
  };

  // Redirect authenticated admin users
  if (user) {
    console.log("User already authenticated:", user);
    if (user.role === 'admin') {
      console.log("Redirecting authenticated admin to dashboard");
      setLocation("/admin");
      return null;
    } else {
      setError("Access denied. Admin privileges required.");
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
          <div className="text-center">
            <div className="bg-white/95 rounded-2xl p-8 shadow-2xl max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold mb-4 text-purple-900">Access Restricted</h1>
              <p className="text-purple-700 mb-6">This area requires admin privileges. Please contact support if you believe this is an error.</p>
              <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium">
                ← Return to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-yellow-400/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-purple-300/5 rounded-full blur-2xl"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-white hover:text-yellow-300 transition-colors mb-6 text-sm">
            ← Back to NextWave Home
          </Link>
          
          {/* NextWave Logo/Branding */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-8 h-8 text-purple-900" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-3">NextWave Admin</h1>
          <p className="text-purple-200 text-lg">Welcome back! Ready to help students achieve their dreams?</p>
        </div>

        <Card className="border-purple-300/20 bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-purple-900">Admin Portal</CardTitle>
            <CardDescription className="text-purple-700">
              Empowering education dreams through seamless platform management
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {error && (
              <Alert className="mb-6 border-red-300 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-purple-900 font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nextwaveadmission@gmail.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                  className="h-12 border-purple-200 focus:border-purple-500 focus:ring-purple-200 bg-white text-purple-900 placeholder-purple-400"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="password" className="text-purple-900 font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your secure password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                    className="h-12 border-purple-200 focus:border-purple-500 focus:ring-purple-200 bg-white text-purple-900 placeholder-purple-400 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Signing you in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Access Admin Dashboard
                  </div>
                )}
              </Button>
            </form>

            {/* Admin features highlight */}
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-yellow-50 rounded-xl border border-purple-100">
              <h3 className="font-bold text-purple-900 mb-4 text-center text-lg">Your Admin Capabilities</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-purple-700">
                  <Users className="w-5 h-5 mr-2 text-yellow-500" />
                  <span className="font-medium">Manage Users</span>
                </div>
                <div className="flex items-center text-purple-700">
                  <BarChart3 className="w-5 h-5 mr-2 text-yellow-500" />
                  <span className="font-medium">View Analytics</span>
                </div>
                <div className="flex items-center text-purple-700">
                  <BookOpen className="w-5 h-5 mr-2 text-yellow-500" />
                  <span className="font-medium">Manage Programs</span>
                </div>
                <div className="flex items-center text-purple-700">
                  <Globe className="w-5 h-5 mr-2 text-yellow-500" />
                  <span className="font-medium">Platform Control</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <div className="flex items-center justify-center space-x-2 text-purple-200 text-sm mb-2">
            <Shield className="w-4 h-4" />
            <span>Secure • Monitored • Authorized Access Only</span>
          </div>
          <p className="text-purple-300 text-xs">
            Empowering student success through responsible platform management
          </p>
        </div>
      </div>
    </div>
  );
}