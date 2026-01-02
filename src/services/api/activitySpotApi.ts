/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActivityType } from "@/types/enums";
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from "@tanstack/react-query";

interface ActivitySpotSearchParams {
    name?: string;
    locationId?: string;
    activityType?: ActivityType;
    isActive?: boolean;
    isPopular?: boolean;
    minRating?: number;
    limit?: number;
    offset?: number;
}

interface CreateActivitySpotData {
    name: string;
    description?: string;
    locationId: string;
    addressId?: string;
    entryCost: number;
    openingHours?: string;
    bestTimeToVisit?: string;
    duration?: string;
    ageRestriction?: string;
    activityType: ActivityType;
    rating?: number;
    isActive: boolean;
    isPopular: boolean;
}

interface UpdateActivitySpotData {
    name?: string;
    description?: string;
    locationId?: string;
    addressId?: string;
    entryCost?: number;
    openingHours?: string;
    bestTimeToVisit?: string;
    duration?: string;
    ageRestriction?: string;
    activityType?: ActivityType;
    rating?: number;
    isActive?: boolean;
    isPopular?: boolean;
}

export async function getAllActivitySpots(queryString?: string) {
    const response = await apiFetch<ApiResponse<ActivitySpot[]>>(
        `/activity-spots${queryString ? `?${queryString}` : ""}`,
        {
            method: "GET",
        }
    );

    return response;
}

export function useGetAllActivitySpotsRQ(queryString?: string) {
    return useQuery<ApiResponse<ActivitySpot[]>>({
        queryFn: () => getAllActivitySpots(queryString),
        queryKey: ["activity-spots", queryString],
        staleTime: queryString ? 0 : 30_000,
        gcTime: 30_000,
        refetchOnMount: queryString ? "always" : false,
    });
}

export async function getPopularActivitySpots() {
    const response = await apiFetch<ApiResponse<ActivitySpot[]>>(
        "/activity-spots/popular",
        {
            method: "GET",
        }
    );

    return response;
}

export function useGetPopularActivitySpotsRQ() {
    return useQuery<ApiResponse<ActivitySpot[]>>({
        queryFn: getPopularActivitySpots,
        queryKey: ["activity-spots", "popular"],
        staleTime: 5 * 60_000,
        gcTime: 10 * 60_000,
    });
}

export async function searchActivitySpots(searchParams: ActivitySpotSearchParams) {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.append(key, String(value));
        }
    });

    const queryString = params.toString();

    const response = await apiFetch<ApiResponse<ActivitySpot[]>>(
        `/activity-spots/search${queryString ? `?${queryString}` : ""}`,
        {
            method: "GET",
        }
    );

    return response;
}

export function useSearchActivitySpotsRQ(searchParams?: ActivitySpotSearchParams) {
    const queryString = searchParams
        ? new URLSearchParams(
              Object.entries(searchParams)
                  .filter(([, value]) => value !== undefined && value !== null)
                  .map(([key, value]) => [key, String(value)])
          ).toString()
        : undefined;

    return useQuery<ApiResponse<ActivitySpot[]>>({
        queryFn: () => searchActivitySpots(searchParams || {}),
        queryKey: ["activity-spots", "search", queryString],
        staleTime: queryString ? 0 : 30_000,
        gcTime: 30_000,
        refetchOnMount: queryString ? "always" : false,
        enabled: !!searchParams && Object.keys(searchParams).length > 0,
    });
}

export async function getActivitySpotDetail(activitySpotId: string) {
    console.log("Fetching activity spot detail for ID:", activitySpotId);
    const response = await apiFetch<ApiResponse<ActivitySpot>>(
        `/activity-spots/${activitySpotId}`,
        {
            method: "GET",
        }
    );
    console.log("Fetched activity spot detail:", response);
    return response;
}

export function useGetActivitySpotDetailRQ(activitySpotId: string) {
    return useQuery<ApiResponse<ActivitySpot>>({
        queryFn: () => getActivitySpotDetail(activitySpotId),
        queryKey: ["activity-spots", activitySpotId],
        enabled: !!activitySpotId,
        staleTime: 30_000,
        gcTime: 30_000,
    });
}

export async function createActivitySpot(data: CreateActivitySpotData) {
    const response = await apiFetch<ApiResponse<ActivitySpot>>(
        "/activity-spots",
        {
            method: "POST",
            body: JSON.stringify(data),
        }
    );

    return response;
}

export function useCreateActivitySpotRQ(
    onSuccessFn: (response: any) => void,
    onErrorFn: () => void
) {
    return useMutation({
        mutationFn: createActivitySpot,
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        },
    });
}

export async function updateActivitySpot(
    activitySpotData: { id: string } & Partial<Omit<TourSpot, "id">>
) {
    const { id, ...updateData } = activitySpotData;
    const response = await apiFetch<ApiResponse<ActivitySpot>>(
        `/activity-spots/${id}`,
        {
            method: "PUT",
            body: JSON.stringify(updateData),
        }
    );

    return response;
}

export function useUpdateActivitySpotRQ(
    onSuccessFn: (response: any) => void,
    onErrorFn: () => void
) {
    return useMutation({
        mutationFn: updateActivitySpot,
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        },
    });
}

export async function deleteActivitySpot(activitySpotId: string) {
    const response = await apiFetch<ApiResponse<{ message: string }>>(
        `/activity-spots/${activitySpotId}`,
        {
            method: "DELETE",
        }
    );

    return response;
}

export function useDeleteActivitySpotRQ(
    onSuccessFn: (response: any) => void,
    onErrorFn: () => void
) {
    return useMutation({
        mutationFn: deleteActivitySpot,
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        },
    });
}

async function deleteActivitySpotImages(activitySpotId: string, imageIds: string[]) {
    const response = await apiFetch<ApiResponse<{ message: string }>>(
        `/activity-spots/${activitySpotId}/images`,
        {
            method: "PUT",
            body: JSON.stringify({ imageIds })
        }
    );

    return response;
}

export function useDeleteActivitySpotImagesRQ(
    onSuccessFn: (response: any) => void,
    onErrorFn: () => void
) {
    return useMutation({
        mutationFn: ({
            activitySpotId,
            imageIds,
        }: {
            activitySpotId: string;
            imageIds: string[];
        }) => deleteActivitySpotImages(activitySpotId, imageIds),
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        },
    });
}

export type {
    ActivitySpotSearchParams,
    CreateActivitySpotData,
    UpdateActivitySpotData,
};

export default getAllActivitySpots;
