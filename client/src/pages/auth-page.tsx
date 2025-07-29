import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/use-auth";
import { handleResumeFlow, clearResumeData, getResumeData } from "../lib/resume-flow";
import { useToast } from "@/hooks/use-toast";

// Define auth form schemas
const loginSchema = z.object({
  username: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  username: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  agencyName: z.string().min(1, "Agency name is required"),
  country: z.string().min(1, "Country is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  role: z.string().min(1, "Please select your account type"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Use auth context
  const { user, isLoading, loginMutation, registerMutation } = useAuth();

  // Handle redirect for users who are already authenticated when page loads
  useEffect(() => {
    if (user && !isLoading && !isSubmitting) {
      console.log("User already authenticated, redirecting immediately");
      
      const resumeData = getResumeData();
      
      if (resumeData) {
        console.log("Found resume data:", resumeData);
        clearResumeData();
        setLocation(resumeData.redirectUrl);
      } else {
        console.log("No resume data found, redirecting to dashboard");
        setLocation("/dashboard");
      }
    }
  }, [user, isLoading, isSubmitting, setLocation]);

  // Handle any unhandled promise rejections from auth mutations
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      agencyName: "",
      country: "",
      phoneNumber: "",
      role: "",
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setLoginError("");
    
    try {
      console.log("Starting login mutation...");
      const user = await loginMutation.mutateAsync(data);
      console.log("Login successful, user:", user);
      
      // Handle immediate redirect after successful login
      const resumeData = getResumeData();
      if (resumeData) {
        console.log("Found resume data, redirecting to:", resumeData.redirectUrl);
        clearResumeData();
        setLocation(resumeData.redirectUrl);
      } else {
        console.log("No resume data, redirecting to dashboard");
        setLocation("/dashboard");
      }
      
      // Reset submitting state after redirect
      setIsSubmitting(false);
      
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError(error.message || "Login failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    setIsSubmitting(true);
    setSignupError("");
    
    try {
      console.log("Starting registration mutation...");
      const user = await registerMutation.mutateAsync(data);
      console.log("Registration successful, user:", user);
      
      // Handle immediate redirect after successful signup
      const resumeData = getResumeData();
      if (resumeData) {
        console.log("Found resume data, redirecting to:", resumeData.redirectUrl);
        clearResumeData();
        setLocation(resumeData.redirectUrl);
      } else {
        console.log("No resume data, redirecting to dashboard");
        setLocation("/dashboard");
      }
      
      // Reset submitting state after redirect
      setIsSubmitting(false);
      
    } catch (error: any) {
      console.error("Registration error:", error);
      setSignupError(error.message || "Registration failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Form Section */}
      <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? "Sign In to NextWave" : "Join NextWave as an Agent"}
            </h1>
            <p className="text-gray-600">
              {isLogin 
                ? "Access your agent dashboard and manage applications" 
                : "Create an account to start representing students"
              }
            </p>
          </div>
          
          {/* Toggle between login and signup */}
          <div className="flex mb-8 border rounded-lg overflow-hidden">
            <button
              className={`w-1/2 py-3 text-center font-medium ${
                isLogin 
                  ? "bg-primary text-white" 
                  : "bg-white text-gray-700"
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`w-1/2 py-3 text-center font-medium ${
                !isLogin 
                  ? "bg-primary text-white" 
                  : "bg-white text-gray-700"
              }`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>
          
          {/* Login Form */}
          {isLogin && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  {...loginForm.register("username")}
                  className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                  placeholder="your@email.com"
                />
                {loginForm.formState.errors.username && (
                  <p className="mt-1 text-sm text-red-600">
                    {loginForm.formState.errors.username.message}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  {...loginForm.register("password")}
                  className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                  placeholder="••••••••"
                />
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              
              {loginError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {loginError}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-primary text-white font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
              
              <p className="text-center text-sm text-gray-600 mt-4">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-primary font-medium hover:text-primary/80"
                >
                  Sign up
                </button>
              </p>
            </form>
          )}
          
          {/* Signup Form */}
          {!isLogin && (
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  {...signupForm.register("username")}
                  className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                  placeholder="your@email.com"
                />
                {signupForm.formState.errors.username && (
                  <p className="mt-1 text-sm text-red-600">
                    {signupForm.formState.errors.username.message}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  {...signupForm.register("password")}
                  className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                  placeholder="••••••••"
                />
                {signupForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    id="first-name"
                    type="text"
                    {...signupForm.register("firstName")}
                    className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                    placeholder="First Name"
                  />
                  {signupForm.formState.errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {signupForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    id="last-name"
                    type="text"
                    {...signupForm.register("lastName")}
                    className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                    placeholder="Last Name"
                  />
                  {signupForm.formState.errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {signupForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="agency-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Agency Name
                </label>
                <input
                  id="agency-name"
                  type="text"
                  {...signupForm.register("agencyName")}
                  className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                  placeholder="Your Agency Name"
                />
                {signupForm.formState.errors.agencyName && (
                  <p className="mt-1 text-sm text-red-600">
                    {signupForm.formState.errors.agencyName.message}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    id="country"
                    type="text"
                    {...signupForm.register("country")}
                    className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                    placeholder="Your Country"
                  />
                  {signupForm.formState.errors.country && (
                    <p className="mt-1 text-sm text-red-600">
                      {signupForm.formState.errors.country.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="text"
                    {...signupForm.register("phoneNumber")}
                    className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                    placeholder="+123456789"
                  />
                  {signupForm.formState.errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {signupForm.formState.errors.phoneNumber.message}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  I am a *
                </label>
                <select
                  id="role"
                  {...signupForm.register("role")}
                  className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                >
                  <option value="">Select account type</option>
                  <option value="agent">Agent</option>
                  <option value="student">Student</option>
                </select>
                {signupForm.formState.errors.role && (
                  <p className="mt-1 text-sm text-red-600">
                    {signupForm.formState.errors.role.message}
                  </p>
                )}
              </div>
              
              {signupError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {signupError}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-primary text-white font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
              
              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-primary font-medium hover:text-primary/80"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="hidden md:flex md:w-1/2 bg-gray-900">
        <div className="flex flex-col justify-center p-12 text-white">
          <h2 className="text-3xl font-bold mb-6">Become a NextWave Education Agent</h2>
          <div className="h-1 w-16 bg-primary mb-6"></div>
          <p className="text-lg mb-8">
            Partner with NextWave and connect international students with premier
            universities in the UAE while earning competitive commissions.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 bg-primary rounded-full flex items-center justify-center mr-3 mt-1">
                <svg className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Direct University Access</h3>
                <p className="text-gray-300 text-sm">Connect with 31+ top universities in the UAE</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 bg-primary rounded-full flex items-center justify-center mr-3 mt-1">
                <svg className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Competitive Commissions</h3>
                <p className="text-gray-300 text-sm">Earn industry-leading commissions on successful applications</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 bg-primary rounded-full flex items-center justify-center mr-3 mt-1">
                <svg className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Comprehensive Support</h3>
                <p className="text-gray-300 text-sm">Get dedicated training and marketing support for your agency</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}