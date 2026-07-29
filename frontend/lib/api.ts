import { AggregatesResponse, FilterState } from "@/types/aggregates";

// Ensure there is no trailing slash in the base URL
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '');

/**
 * A simple loading-safe fetch utility.
 */
export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Ensure the endpoint starts with a slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    return await res.json() as T;
  } catch (error) {
    console.error('fetchApi error:', error);
    throw error;
  }
}

/**
 * Fetches analytics aggregates data with optional query filters.
 */
export async function getAggregates(filters: Partial<FilterState> = {}): Promise<AggregatesResponse> {
  const params = new URLSearchParams();
  if (filters.department) params.append("department", filters.department);
  if (filters.task_category) params.append("task_category", filters.task_category);
  if (filters.employee_id) params.append("employee_id", filters.employee_id);
  if (filters.week) params.append("week", filters.week);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  // Hits GET /api/aggregates/ (or with query params)
  return fetchApi<AggregatesResponse>(`/aggregates/${queryString}`);
}
