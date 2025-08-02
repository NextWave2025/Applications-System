import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient, API_BASE_URL } from "../lib/query-client";
import { useToast } from "./use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  agencyName?: string;
  country?: string;
  phoneNumber?: string;
  website?: string;
  role?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const {
    data: user,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        // 🚨 CRITICAL FIX: Use environment-aware API URL
        const apiUrl = `${API_BASE_URL}/user`;
        console.log('🔑 Auth check URL:', apiUrl);
        console.log('=== AUTH API DEBUG ===');
        console.log('Current hostname:', window.location.hostname);
        console.log('API URL being used:', apiUrl);
        
        const response = await fetch(apiUrl, {
          credentials: "include"
        });
        
        console.log('Auth response status:', response.status);
        console.log('Auth response from:', response.url);
        
        if (response.status === 401 || response.status === 403) {
          console.log('❌ Not authenticated (401/403)');
          return null;
        }
        if (!response.ok) {
          console.warn(`❌ Auth query failed: ${response.status} ${response.statusText}`);
          return null;
        }
        const userData = await response.json();
        console.log("✅ Auth query successful:", userData);
        return userData;
      } catch (error) {
        console.warn("❌ Auth query error:", error);
        return null;
      }
    },
    retry: false,
    throwOnError: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        console.log('=== AUTH LOGIN DEBUG ===');
        console.log('Current hostname:', window.location.hostname);
        console.log('API base URL:', API_BASE_URL);
        console.log('Login attempt for:', credentials.username);
        
        const res = await apiRequest("POST", "/login", credentials);
        
        console.log('Login response status:', res.status);
        console.log('Login response from:', res.url);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ Login API Error:', errorText);
          
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: 'Login failed' };
          }
          
          throw new Error(errorData.message || 'Login failed');
        }
        
        const userData = await res.json();
        console.log("✅ Login successful, user data:", userData);
        return userData;
      } catch (error) {
        console.error("❌ Login mutation error:", error);
        throw error instanceof Error ? error : new Error('Login failed');
      }
    },
    onSuccess: async (user: User) => {
      console.log("Login mutation onSuccess called, setting user data:", user);
      
      try {
        // 🚨 CRITICAL FIX: Set user data immediately and force cache update
        queryClient.setQueryData(["/api/user"], user);
        
        // Force a small delay to ensure cache is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Invalidate queries to trigger UI updates
        await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        
        console.log("Login success: Cache updated and queries invalidated");
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      } catch (error) {
        console.error("Error in login onSuccess handler:", error);
        // Fallback: still set user data
        queryClient.setQueryData(["/api/user"], user);
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      }
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      const message = error?.message || "Login failed. Please try again.";
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
    },
    retry: false,
    throwOnError: true,
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      try {
        console.log("Registration attempt for:", credentials.username);
        const res = await apiRequest("POST", "/register", credentials);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'Registration failed' }));
          throw new Error(errorData.message || 'Registration failed');
        }
        const userData = await res.json();
        console.log("Registration successful, user data:", userData);
        return userData;
      } catch (error) {
        console.error("Registration error:", error);
        throw error instanceof Error ? error : new Error('Registration failed');
      }
    },
    onSuccess: async (user: User) => {
      console.log("Registration mutation onSuccess called with user:", user);
      
      try {
        // 1. Immediately set user data in cache to trigger auth state update
        console.log("Setting user data in cache immediately");
        queryClient.setQueryData(["/api/user"], user);
        
        // 2. Force synchronous completion with minimal delay
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 3. Force invalidation of auth queries only to trigger UI updates
        console.log("Invalidating auth queries for UI updates");
        await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        
        console.log("Registration success: Cache updated and queries invalidated");
        toast({
          title: "Registration successful",
          description: "Welcome to NextWave!",
        });
        
      } catch (error) {
        console.error("Error in registration onSuccess handler:", error);
        // Fallback: still show success message and set basic cache
        queryClient.setQueryData(["/api/user"], user);
        toast({
          title: "Registration successful",
          description: "Welcome to NextWave!",
        });
      }
    },
    onError: (error: Error) => {
      console.error("Registration mutation error:", error);
      const message = error?.message || "Registration failed. Please try again.";
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
    },
    retry: false,
    throwOnError: true,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: (user as User) || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}