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
          console.warn(`Auth query failed: ${response.status} ${response.statusText}`);
          return null;
        }
        const userData = await response.json();
        console.log("Auth query successful:", userData);
        return userData;
      } catch (error) {
        console.warn("Auth query error:", error);
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
        console.log("Attempting login for:", credentials.username);
        const res = await apiRequest("POST", "/api/login", credentials);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'Login failed' }));
          throw new Error(errorData.message || 'Login failed');
        }
        const userData = await res.json();
        console.log("Login successful, user data:", userData);
        return userData;
      } catch (error) {
        console.error("Login mutation error:", error);
        throw error instanceof Error ? error : new Error('Login failed');
      }
    },
    onSuccess: async (user: User) => {
      console.log("Login mutation onSuccess called, setting user data:", user);
      
      // Set user data immediately in cache to trigger auth state update
      queryClient.setQueryData(["/api/user"], user);
      
      // Force immediate refetch to ensure state consistency
      try {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["/api/user"] }),
          queryClient.invalidateQueries({ queryKey: ["/api/admin"] })
        ]);
        console.log("User queries invalidated and refetched");
      } catch (error) {
        console.error("Error invalidating queries after login:", error);
      }
      
      console.log("Login success: Cache updated, showing toast");
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
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
        const res = await apiRequest("POST", "/api/register", credentials);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'Registration failed' }));
          throw new Error(errorData.message || 'Registration failed');
        }
        return await res.json();
      } catch (error) {
        console.error("Registration error:", error);
        throw error instanceof Error ? error : new Error('Registration failed');
      }
    },
    onSuccess: async (user: User) => {
      console.log("Registration mutation onSuccess called, setting user data:", user);
      
      // Set user data immediately in cache to trigger auth state update
      queryClient.setQueryData(["/api/user"], user);
      
      // Force immediate refetch to ensure state consistency
      try {
        await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        console.log("User query invalidated after registration");
      } catch (error) {
        console.error("Error invalidating queries after registration:", error);
      }
      
      console.log("Registration success: Cache updated, showing toast");
      toast({
        title: "Registration successful",
        description: "Welcome to NextWave!",
      });
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