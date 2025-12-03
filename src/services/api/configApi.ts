/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "../apiInstance";

// Get site configuration
export async function getSiteConfig() {
    const response = await apiFetch<ApiResponse<SiteConfig>>(`/config/site`, {
        method: 'GET',
        revalidate: 500,
    });

    return response;
}

export function useGetSiteConfigRQ() {
    return useQuery<ApiResponse<SiteConfig>>({
        queryFn: () => getSiteConfig(),
        queryKey: ["config"],
        staleTime: 60_000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Update site configuration
export async function updateSiteConfig(configData: { id: string } & Partial<Omit<SiteConfig, 'id'>>) {
    const response = await apiFetch<ApiResponse<SiteConfig>>(`/config/site`, {
        method: 'PUT',
        body: JSON.stringify(configData)
    });

    return response;
}

export function useUpdateSiteConfigRQ(
    onSuccessFn: (response: ApiResponse<SiteConfig>) => void,
    onErrorFn: () => void
) { 
    return useMutation({
        mutationFn: updateSiteConfig,
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        }
    });
}

export async function deleteHeroSectionImages(configId: string, imageIds: string[]) {
  const response = await apiFetch<ApiResponse<null>>(`/config/site`, {
    method: 'PUT',
    body: JSON.stringify({ imageIds }),
  });

  return response;
}

export function useDeleteHeroSectionImagesRQ(onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) {
    return useMutation({
        mutationFn: ({configId, imageIds} : {configId: string, imageIds: string[]}) => deleteHeroSectionImages(configId, imageIds),
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        }
    });
}