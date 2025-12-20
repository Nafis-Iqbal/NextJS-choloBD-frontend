/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActivityType } from "@/types/enums";
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from "@tanstack/react-query";

interface TourSpotSearchParams {
    name?: string;
    locationId?: string;
    spotType?: ActivityType;
    isPopular?: boolean;
    minRating?: number;
    limit?: number;
    offset?: number;
}

interface CreateTourSpotData {
    name: string;
    description?: string;
    locationId: string;
    addressId?: string;
    entryCost?: number;
    openingHours?: string;
    bestTimeToVisit?: string;
    contactInfo?: Record<string, any>;
    facilities: string[];
    seasonalInfo?: Record<string, any>;
    spotType: ActivityType;
    rating?: number;
    isPopular: boolean;
}

interface UpdateTourSpotData {
    name?: string;
    description?: string;
    locationId?: string;
    addressId?: string;
    entryCost?: number;
    openingHours?: string;
    bestTimeToVisit?: string;
    contactInfo?: Record<string, any>;
    facilities?: string[];
    accessibility?: string[];
    seasonalInfo?: Record<string, any>;
    spotType?: ActivityType;
    rating?: number;
    isPopular?: boolean;
}

async function getAllTourSpots(queryString?: string) {
    const response = await apiFetch<ApiResponse<TourSpot[]>>(
        `/tour-spots${queryString ? `?${queryString}` : ""}`,
        {
            method: "GET",
        }
    );

    return response;
}

export function useGetAllTourSpotsRQ(queryString?: string) {
    return useQuery<ApiResponse<TourSpot[]>>({
        queryFn: () => getAllTourSpots(queryString),
        queryKey: ["tour-spots", queryString],
        staleTime: queryString ? 0 : 30_000,
        gcTime: 30_000,
        refetchOnMount: queryString ? "always" : false,
    });
}

async function getPopularTourSpots() {
    const response = await apiFetch<ApiResponse<TourSpot[]>>(
        "/tour-spots/popular",
        {
            method: "GET",
        }
    );

    return response;
}

export function useGetPopularTourSpotsRQ() {
    return useQuery<ApiResponse<TourSpot[]>>({
        queryFn: getPopularTourSpots,
        queryKey: ["tour-spots", "popular"],
        staleTime: 5 * 60_000,
        gcTime: 10 * 60_000,
    });
}

async function searchTourSpots(searchParams: TourSpotSearchParams) {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.append(key, String(value));
        }
    });

    const queryString = params.toString();

    const response = await apiFetch<ApiResponse<TourSpot[]>>(
        `/tour-spots/search${queryString ? `?${queryString}` : ""}`,
        {
            method: "GET",
        }
    );

    return response;
}

export function useSearchTourSpotsRQ(searchParams?: TourSpotSearchParams) {
    const queryString = searchParams
        ? new URLSearchParams(
              Object.entries(searchParams)
                  .filter(([, v]) => v !== undefined && v !== null)
                  .map(([k, v]) => [k, String(v)])
          ).toString()
        : undefined;

    return useQuery<ApiResponse<TourSpot[]>>({
        queryFn: () => searchTourSpots(searchParams || {}),
        queryKey: ["tour-spots", "search", queryString],
        staleTime: queryString ? 0 : 30_000,
        gcTime: 30_000,
        refetchOnMount: queryString ? "always" : false,
        enabled: !!searchParams && Object.keys(searchParams).length > 0,
    });
}

export async function getTourSpotDetail(tourSpotId: string) {
    const response = await apiFetch<ApiResponse<TourSpot>>(
        `/tour-spots/${tourSpotId}`,
        {
            method: "GET",
        }
    );

    return response;
}

export function useGetTourSpotDetailRQ(tourSpotId: string) {
    return useQuery<ApiResponse<TourSpot>>({
        queryFn: () => getTourSpotDetail(tourSpotId),
        queryKey: ["tour-spots", tourSpotId],
        enabled: !!tourSpotId,
        staleTime: 30_000,
        gcTime: 30_000,
    });
}

async function createTourSpot(data: CreateTourSpotData) {
    const response = await apiFetch<ApiResponse<TourSpot>>("/tour-spots", {
        method: "POST",
        body: JSON.stringify(data),
    });

    return response;
}

export function useCreateTourSpotRQ(
    onSuccessFn: (response: any) => void,
    onErrorFn: () => void
) {
    return useMutation({
        mutationFn: createTourSpot,
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        },
    });
}

async function updateTourSpot(
    tourSpotId: string,
    data: UpdateTourSpotData
) {
    const response = await apiFetch<ApiResponse<TourSpot>>(
        `/tour-spots/${tourSpotId}`,
        {
            method: "PUT",
            body: JSON.stringify(data),
        }
    );

    return response;
}

export function useUpdateTourSpotRQ(
    onSuccessFn: (response: any) => void,
    onErrorFn: () => void
) {
    return useMutation({
        mutationFn: ({
            tourSpotId,
            data,
        }: {
            tourSpotId: string;
            data: UpdateTourSpotData;
        }) => updateTourSpot(tourSpotId, data),
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        },
    });
}

async function deleteTourSpot(tourSpotId: string) {
    const response = await apiFetch<ApiResponse<{ message: string }>>(
        `/tour-spots/${tourSpotId}`,
        {
            method: "DELETE",
        }
    );

    return response;
}

export function useDeleteTourSpotRQ(
    onSuccessFn: (response: any) => void,
    onErrorFn: () => void
) {
    return useMutation({
        mutationFn: deleteTourSpot,
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        },
    });
}

async function deleteTourSpotImages(tourSpotId: string, imageIds: string[]) {
    const response = await apiFetch<ApiResponse<{ message: string }>>(
        `/tour-spots/${tourSpotId}/images`,
        {
            method: "PUT",
            body: JSON.stringify({ imageIds })
        }
    );

    return response;
}

export function useDeleteTourSpotImagesRQ(
    onSuccessFn: (response: any) => void,
    onErrorFn: () => void
) {
    return useMutation({
        mutationFn: ({
            tourSpotId,
            imageIds,
        }: {
            tourSpotId: string;
            imageIds: string[];
        }) => deleteTourSpotImages(tourSpotId, imageIds),
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        },
    });
}

export type {
    TourSpotSearchParams,
    CreateTourSpotData,
    UpdateTourSpotData,
};

export default getAllTourSpots;
