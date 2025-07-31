import { QueryClient } from "@tanstack/react-query";

type ApiMethodType = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// 🚨 CRITICAL FIX: Environment-aware API base URL configuration
export const getApiBaseUrl = (): string => {
  // Check if we're in production (deployed environment)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Production detection - not localhost
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const baseUrl = `${window.location.origin}/api`;
      console.log('🌐 PRODUCTION API URL:', baseUrl);
      return baseUrl;
    }
  }
  
  // Development fallback
  const devUrl = 'http://localhost:5000/api';
  console.log('🛠️ DEVELOPMENT API URL:', devUrl);
  return devUrl;
};

// Global API base URL
export const API_BASE_URL = getApiBaseUrl();

type GetQueryFnOptions = {
  on401?: "throw" | "returnNull";
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
      throwOnError: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
      throwOnError: false,
    },
  },
});

export async function apiRequest(
  method: ApiMethodType,
  url: string,
  body?: any,
  customHeaders?: HeadersInit
) {
  // 🚨 CRITICAL FIX: Ensure all API calls use proper base URL
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/api') ? url.slice(4) : url}`;
  
  console.log(`🔗 API Request: ${method} ${fullUrl}`);
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  const config: RequestInit = {
    method,
    headers,
    credentials: "include", // important for cookies
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(fullUrl, config);

  if (!response.ok) {
    // Try to get error message from response
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || response.statusText;
    } catch (e) {
      errorMessage = response.statusText;
    }

    const error = new Error(errorMessage);
    (error as any).status = response.status;
    throw error;
  }

  return response;
}

export function getQueryFn<T>(options: GetQueryFnOptions = {}) {
  return async ({ queryKey }: any): Promise<T> => {
    try {
      const [path] = queryKey;
      // 🚨 CRITICAL FIX: Ensure query paths use environment-aware URLs
      const response = await apiRequest("GET", path);
      
      // If the response is 204 No Content, return null
      if (response.status === 204) {
        return null as T;
      }
      
      return await response.json();
    } catch (error: any) {
      if (error.status === 401 && options.on401 === "returnNull") {
        return null as T;
      }
      throw error;
    }
  };
}