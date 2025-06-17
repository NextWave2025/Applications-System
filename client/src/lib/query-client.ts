import { QueryClient } from "@tanstack/react-query";

type ApiMethodType = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type GetQueryFnOptions = {
  on401?: "throw" | "returnNull";
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false, // Disable retries to prevent unhandled rejections
      throwOnError: false, // Prevent throwing errors that cause unhandled rejections
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export async function apiRequest(
  method: ApiMethodType,
  url: string,
  body?: any,
  customHeaders?: HeadersInit
) {
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

  const response = await fetch(url, config);

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