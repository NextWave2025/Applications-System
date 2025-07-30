import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/use-auth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";
import { apiRequest } from "../lib/query-client";
import { useToast } from "../hooks/use-toast";
import { Eye, EyeOff, GraduationCap, BookOpen, Users, Globe } from "lucide-react";

export default function StudentAuthPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    currentEducation: "",
    studyField: "",
    agreeToTerms: false,
  });

  // Use the working authentication from useAuth hook
  const { loginMutation: authLoginMutation, registerMutation: authRegisterMutation } = useAuth();

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const userData = await authLoginMutation.mutateAsync({ username: data.email, password: data.password });
      return userData;
    },
    onSuccess: async (userData: any) => {
      console.log("Student login success, checking redirect");
      
      // Check if user role matches the login page
      if (userData && userData.role !== 'student') {
        const message = `This account is registered as ${userData.role}. Please log in via the ${userData.role} portal or sign up with a new student account.`;
        setError(message);
        toast({
          title: "⚠️ Wrong Login Portal",
          description: message,
          variant: "destructive",
        });
        return;
      }
      
      // Wait for auth state to propagate, then redirect
      setTimeout(() => {
        // Check if there's a redirectTo URL in localStorage for application flow
        const redirectTo = localStorage.getItem("redirectTo");
        if (redirectTo) {
          localStorage.removeItem("redirectTo");
          setLocation(redirectTo);
          return;
        }
        
        // Check for redirectAfterLogin from ProtectedRoute
        const redirectAfterLogin = localStorage.getItem("redirectAfterLogin");
        if (redirectAfterLogin) {
          localStorage.removeItem("redirectAfterLogin");
          setLocation(redirectAfterLogin);
          return;
        }
        
        // Default redirect
        setLocation("/student-dashboard");
      }, 200);
    },
    onError: (error: any) => {
      setError(error.message || "Login failed");
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: any) => {
      // Use the auth hook's register mutation directly
      return await authRegisterMutation.mutateAsync({ 
        username: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phone,
        role: "student"
      });
    },
    onSuccess: async (userData: any) => {
      console.log("Student signup success, userData:", userData);
      
      try {
        // 1. Wait for auth state to fully propagate  
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 2. Force auth query refetch to ensure user state is current
        await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        
        // 3. Additional delay to ensure React Query cache propagates to components
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 4. Get redirect destination
        const redirectTo = localStorage.getItem("redirectTo");
        const targetUrl = redirectTo || "/student-dashboard";
        
        if (redirectTo) {
          localStorage.removeItem("redirectTo");
          console.log("Redirecting student to application:", redirectTo);
        } else {
          console.log("Redirecting student to dashboard");
        }
        
        // 5. Navigate with replace to prevent back button issues
        setLocation(targetUrl);
        
        // 6. Fallback navigation if primary redirect fails
        setTimeout(() => {
          if (window.location.pathname !== targetUrl && !window.location.pathname.includes('/student')) {
            console.log("Fallback redirect triggered for:", targetUrl);
            window.location.href = targetUrl;
          }
        }, 500);
        
        toast({
          title: "Welcome to NextWave!",
          description: "Your student account has been created successfully.",
        });
        
      } catch (error) {
        console.error("Error in student signup success handler:", error);
        // Emergency fallback
        setLocation("/student-dashboard");
        toast({
          title: "Welcome to NextWave!",
          description: "Your student account has been created successfully.",
        });
      }
    },
    onError: (error: any) => {
      console.error("Student signup error:", error);
      setError(error.message || "Registration failed");
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate(loginForm);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!signupForm.agreeToTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }

    const { confirmPassword, agreeToTerms, ...signupData } = signupForm;
    signupMutation.mutate(signupData);
  };

  if (user) {
    const redirectTo = localStorage.getItem("redirectTo");
    if (redirectTo) {
      localStorage.removeItem("redirectTo");
      setLocation(redirectTo);
    } else {
      setLocation("/student-dashboard");
    }
    return null;
  }

  const studyFields = [
    "Business Administration",
    "Engineering",
    "Computer Science",
    "Medicine",
    "Architecture",
    "Finance",
    "Marketing",
    "International Relations",
    "Arts & Design",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/10 rounded-full"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-white hover:text-secondary transition-colors mb-4">
            ← Back to Student Page
          </Link>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-black" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Student Portal</h1>
          <p className="text-white/80">Your gateway to UAE universities</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Get Started</TabsTrigger>
            </TabsList>

            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="login">
              <CardHeader className="text-center pb-4">
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Continue your UAE university application journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@example.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-secondary hover:bg-yellow-400 text-black font-bold"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing In..." : "Continue My Application"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="signup">
              <CardHeader className="text-center pb-4">
                <CardTitle>Start Your Journey</CardTitle>
                <CardDescription>
                  Create your account to apply to UAE universities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Benefits highlight */}
                <div className="bg-secondary/10 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-primary mb-2">What You Get:</h3>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li className="flex items-center"><Globe className="w-3 h-3 mr-1 text-secondary" /> 20+ UAE universities options</li>
                    <li className="flex items-center"><Users className="w-3 h-3 mr-1 text-secondary" /> Access to Student Community</li>
                    <li className="flex items-center"><BookOpen className="w-3 h-3 mr-1 text-secondary" /> Internship Opportunities</li>
                    <li className="flex items-center"><Users className="w-3 h-3 mr-1 text-secondary" /> Personal guidance</li>
                  </ul>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Sarah"
                        value={signupForm.firstName}
                        onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Johnson"
                        value={signupForm.lastName}
                        onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">Email Address</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder="student@example.com"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">WhatsApp Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+971 50 123 4567"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentEducation">Current Education Level</Label>
                    <Input
                      id="currentEducation"
                      placeholder="e.g., High School Graduate, Bachelor's"
                      value={signupForm.currentEducation}
                      onChange={(e) => setSignupForm({ ...signupForm, currentEducation: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studyField">Field of Interest</Label>
                    <select
                      id="studyField"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={signupForm.studyField}
                      onChange={(e) => setSignupForm({ ...signupForm, studyField: e.target.value })}
                    >
                      <option value="">Select your field</option>
                      {studyFields.map((field) => (
                        <option key={field} value={field}>
                          {field}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Password</Label>
                    <div className="relative">
                      <Input
                        id="signupPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      checked={signupForm.agreeToTerms}
                      onChange={(e) => setSignupForm({ ...signupForm, agreeToTerms: e.target.checked })}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="agreeToTerms" className="text-sm">
                      I agree to the <Link href="/terms" className="text-primary hover:underline">Terms & Conditions</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                    </Label>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-secondary hover:bg-yellow-400 text-black font-bold"
                    disabled={signupMutation.isPending}
                  >
                    {signupMutation.isPending ? "Creating Account..." : "Start My Application"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center mt-6">
          <p className="text-white/60 text-sm">
            Need help? Contact our student support team at{" "}
            <a href="mailto:students@nextwave.com" className="text-secondary hover:underline">
              students@nextwave.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}