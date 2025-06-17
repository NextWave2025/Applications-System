import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/query-client";
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
        const response = await fetch("/api/user", {
          credentials: "include"
        });
        if (response.status === 401 || response.status === 403) {
          return null;
        }
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const userData = await response.json();
        console.log("Auth query successful:", userData);
        return userData;
      } catch (error) {
        console.error("Auth query error:", error);
        // Don't throw here to prevent unhandled rejections
        return null;
      }
    },
    retry: false,
    throwOnError: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Enable mount refetch to ensure fresh auth state
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Add error boundary to prevent unhandled rejections
    meta: {
      errorHandler: (error: Error) => {
        console.error("Auth query meta error:", error);
        return null;
      }
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        console.log("Attempting login for:", credentials.username);
        const res = await apiRequest("POST", "/api/login", credentials);
        const userData = await res.json();
        console.log("Login successful, user data:", userData);
        return userData;
      } catch (error) {
        console.error("Login mutation error:", error);
        throw error;
      }
    },
    onSuccess: (user: User) => {
      console.log("Setting user data in query cache:", user);
      queryClient.setQueryData(["/api/user"], user);
      // Invalidate and refetch all admin queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin"] });
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: "Welcome to Guide!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
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