import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/use-auth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { apiRequest } from "../lib/queryClient";
import { Eye, EyeOff, Shield, Users, Settings } from "lucide-react";

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
      // Check if user is actually an admin
      if (userData && userData.role === 'admin') {
        console.log("Redirecting to admin dashboard");
        
        // Wait a brief moment to ensure auth state is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setLocation("/admin");
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
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p>Admin privileges required.</p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/5 rounded-full"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-white hover:text-red-400 transition-colors mb-4">
            ← Back to Home
          </Link>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400">Secure administrative access</p>
        </div>

        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-white">Administrator Login</CardTitle>
            <CardDescription className="text-gray-300">
              Enter your admin credentials to access the control panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-600 bg-red-900/20">
                <AlertDescription className="text-red-300">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@nextwave.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-lg"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Authenticating..." : "Access Admin Panel"}
              </Button>
            </form>

            {/* Admin features highlight */}
            <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
              <h3 className="font-semibold text-gray-200 mb-2 text-center">Admin Features:</h3>
              <ul className="text-sm space-y-1 text-gray-300">
                <li className="flex items-center justify-center"><Users className="w-3 h-3 mr-1 text-red-400" /> User Management</li>
                <li className="flex items-center justify-center"><Settings className="w-3 h-3 mr-1 text-red-400" /> System Configuration</li>
                <li className="flex items-center justify-center"><Shield className="w-3 h-3 mr-1 text-red-400" /> Security Controls</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Authorized personnel only. All access is logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
}