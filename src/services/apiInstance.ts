/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_BASE_URL, DEFAULT_HEADERS } from '@/lib/apiConfig';
import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient();

interface FetchOptions extends RequestInit {
    token?: string;
    cache?: RequestCache; 
    revalidate?: number | false; 
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, headers, cache, revalidate, ...rest} = options;

    const mergedHeaders = {
      ...DEFAULT_HEADERS,
      ...headers,
    };

    const fetchInit: RequestInit & { next?: { revalidate?: number | false } } = {
        ...rest,
        headers: mergedHeaders,
        credentials: 'include', // Include cookies in requests for authentication
    };

    // Apply caching strategies for Next.js App Router
    if (typeof revalidate !== "undefined") {
        fetchInit.next = { revalidate }; // ISR if number, disable ISR if false
    }
    if (cache) {
        fetchInit.cache = cache; // SSR: "no-store", CSR: "default", etc.
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, fetchInit);

    return res.json() as Promise<T>;
}

export async function apiFetchExternalURL(endpoint: string, options: FetchOptions = {}): Promise<any> {
  const { token, headers, ...rest } = options;

  const mergedHeaders = {
    ...DEFAULT_HEADERS,
    ...headers,
  };

  const res = await fetch(`${endpoint}`, {
    ...rest,
    headers: mergedHeaders,
    credentials: 'include', // Include cookies for external API calls too
  });

  return res.json() as Promise<any>;
}