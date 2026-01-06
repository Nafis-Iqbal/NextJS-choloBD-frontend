/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "../apiInstance";
import { useQuery } from '@tanstack/react-query';

export async function getCombinedSubstringSearchResult(queryString?: string) {
  const response = await apiFetch<ApiResponse<any>>(`/search/combined${queryString ? `?${queryString}` : ""}`, {
    method: 'GET'
  });

  return response;
}

export function useGetCombinedSubstringSearchResultRQ({queryString, enabled = true} : {queryString?: string, enabled: boolean}) {
  return useQuery<ApiResponse<any>>({
    queryFn: () => getCombinedSubstringSearchResult(queryString),
    queryKey: ["combined-search", queryString],
    staleTime: queryString ? 0 : 30_000,
    gcTime: 30 * 1000,
    refetchOnMount: queryString ? "always" : false,
    enabled
  });
}