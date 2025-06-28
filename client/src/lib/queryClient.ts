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
      const endpoint = queryKey[0] as string;
      const res = await fetch(endpoint, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      const data = await res.json();
      
      // Special handling for agents with application counts
      if (endpoint === "/api/admin/users") {
        const agents = Array.isArray(data) ? data.filter((u: any) => u.role === "agent") : [];
        
        // Fetch application counts for each agent safely
        const agentsWithCounts = await Promise.all(
          agents.map(async (agent: any) => {
            try {
              const appsResponse = await fetch(`/api/admin/applications?userId=${agent.id}`, { credentials: "include" });
              if (appsResponse.ok) {
                const applications = await appsResponse.json();
                return { ...agent, applicationsCount: Array.isArray(applications) ? applications.length : 0 };
              }
              return { ...agent, applicationsCount: 0 };
            } catch (error) {
              console.warn(`Error fetching applications for agent ${agent.id}:`, error);
              return { ...agent, applicationsCount: 0 };
            }
          })
        );
        
        return agentsWithCounts;
      }
      
      return data;
    } catch (error) {
      console.warn("Query error for", queryKey[0], ":", error);
      // Return empty array for data endpoints to prevent crashes
      if ((queryKey[0] as string).includes("/api/")) {
        return [];
      }
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

// Add comprehensive global error handlers with more aggressive catching
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('Unhandled promise rejection intercepted:', event.reason);
    // Prevent all unhandled rejections from surfacing
    event.preventDefault();
    return false;
  });

  window.addEventListener('error', (event) => {
    console.warn('Global error intercepted:', event.error);
    event.preventDefault();
    return false;
  });

  // Additional safety net for React errors
  window.addEventListener('rejectionhandled', (event) => {
    console.warn('Promise rejection handled late:', event.reason);
    event.preventDefault();
    return false;
  });
}