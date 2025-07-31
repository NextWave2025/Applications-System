import { QueryClient } from "@tanstack/react-query";

type ApiMethodType = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// 🌐 UNIVERSAL API CONFIGURATION - Works across ANY production environment
export const getApiBaseUrl = (): string => {
  // Server-side rendering or Node.js environment
  if (typeof window === 'undefined') {
    return process.env.API_BASE_URL || process.env.VITE_API_URL || 'http://localhost:5000/api';
  }
  
  const { hostname, protocol, port, origin } = window.location;
  
  // 1. Environment variable override (highest priority)
  if (import.meta.env.VITE_API_URL) {
    console.log('🔧 Using VITE_API_URL override:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. Comprehensive local development detection
  const isLocalDevelopment = hostname === 'localhost' || 
                            hostname === '127.0.0.1' || 
                            hostname === '0.0.0.0' ||
                            hostname.startsWith('192.168.') ||
                            hostname.startsWith('10.') ||
                            hostname.startsWith('172.16.') ||
                            hostname.endsWith('.local') ||
                            hostname.endsWith('.localhost') ||
                            port === '3000' || port === '5173' || port === '8080';
  
  if (isLocalDevelopment) {
    const devUrl = 'http://localhost:5000/api';
    console.log('🛠️ LOCAL DEV API URL:', devUrl, { hostname, port });
    return devUrl;
  }
  
  // 3. Universal Production: Works with ANY domain/platform
  // Custom domains, Replit, Vercel, Netlify, Heroku, Railway, AWS, Azure, etc.
  const prodUrl = `${origin}/api`;
  console.log('🌐 UNIVERSAL PRODUCTION API URL:', prodUrl, {
    hostname,
    protocol,
    port,
    origin,
    environment: 'universal-production'
  });
  
  return prodUrl;
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
  console.log('🍪 API Request with credentials: include');
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  const config: RequestInit = {
    method,
    headers,
    credentials: "include", // 🚨 CRITICAL: Essential for session cookies in production
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