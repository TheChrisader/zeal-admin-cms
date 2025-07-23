const BASE_URL =
  // import.meta.env.VITE_API_URL ||
  // "http://localhost:3000" ||
  "https://zealnews.africa";

// Define a custom error class for API errors
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: any
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");

  const defaultHeaders: HeadersInit = {
    // "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers: defaultHeaders,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    localStorage.removeItem("token");
    // window.location.href = "/login";
    // Throw an error to stop further execution in the calling function
    throw new ApiError(response.status, response.statusText, {
      message: "Unauthorized",
    });
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }
    // Throw a custom error with status and data
    throw new ApiError(response.status, response.statusText, errorData);
  }

  // For 204 No Content, return null as there's no body to parse
  if (response.status === 204) {
    return null as T;
  }

  // Otherwise, parse and return the JSON body
  return response.json() as Promise<T>;
}
