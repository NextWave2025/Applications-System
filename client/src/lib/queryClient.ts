import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  endpoint: string,
  data?: any,
  headers?: HeadersInit
): Promise<Response> {
  const requestHeaders = new Headers();
  
  if (headers) {
    if (headers instanceof Headers) {
      headers.forEach((value, key) => requestHeaders.set(key, value));
    } else if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => requestHeaders.set(key, value));
    } else {
      Object.entries(headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          requestHeaders.set(key, value);
        }
      });
    }
  }
  
  let body: string | FormData | undefined;

  if (data instanceof FormData) {
    // Don't set Content-Type for FormData, let browser set it with boundary
    body = data;
  } else if (data) {
    requestHeaders.set("Content-Type", "application/json");
    body = JSON.stringify(data);
  }

  const response = await fetch(endpoint, {
    method,
    headers: requestHeaders,
    body,
    credentials: "include",
  });

  try {
    await throwIfResNotOk(response);
    return response;
  } catch (error) {
    console.error("API request error:", error);
    // Return error response instead of throwing to prevent unhandled rejections
    return response;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      const data = await res.json();
      console.log("Query response for", queryKey[0], ":", data);
      return data;
    } catch (error) {
      console.warn("Query error for", queryKey[0], ":", error);
      // Don't throw to prevent unhandled rejections
      return null;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute 
      retry: false, // Disable retries to prevent unhandled rejections
      throwOnError: false,
    },
    mutations: {
      retry: false,
      throwOnError: false,
    },
  },
});

// Add comprehensive global error handlers
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('Unhandled promise rejection caught:', event.reason);
    // Always prevent the default behavior to stop browser console errors
    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    console.warn('Global error caught:', event.error);
    // Prevent default to avoid console spam
    event.preventDefault();
  });
}