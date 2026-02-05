/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation, UseQueryResult, UseMutationResult } from "@tanstack/react-query";

interface CreateTourPlanData {
    packageName: string;
    shortDescription?: string;
    tourType: string;
    duration: number;
    maxGroupSize?: number;
    locationId: string;
    totalBudget?: number;
    isActive?: boolean;
    isPopular?: boolean;
    daySegments: Array<{
        dayNumber: number;
        tourSpotId?: string;
        activitySpotId?: string;
        transportOption?: string;
        hotelOption?: string;
    }>;
}

interface UpdateTourPlanData {
    packageName?: string;
    shortDescription?: string;
    tourType?: string;
    duration?: number;
    maxGroupSize?: number;
    locationId?: string;
    totalBudget?: number;
    isActive?: boolean;
    isPopular?: boolean;
    daySegments?: Array<{
        dayNumber: number;
        tourSpotId?: string;
        activitySpotId?: string;
        transportOption?: string;
        hotelOption?: string;
    }>;
}

async function getAllTourPlans(queryString?: string) {
    const response = await apiFetch<ApiResponse<TourPackage[]>>(
        `/tour-builder${queryString ? `?${queryString}` : ""}`,
        {
            method: "GET",
        }
    );

    return response;
}

export function useGetAllTourPlansRQ(
    queryString?: string
): UseQueryResult<ApiResponse<TourPackage[]>, Error> {
    return useQuery<ApiResponse<TourPackage[]>>({
        queryFn: () => getAllTourPlans(queryString),
        queryKey: ["tour-plans", queryString],
        staleTime: queryString ? 0 : 30_000,
        gcTime: 30_000,
        refetchOnMount: queryString ? "always" : false,
    });
}

async function getTourPlanDetails(tourPackageId: string) {
    const response = await apiFetch<ApiResponse<TourPackage>>(
        `/tour-builder/${tourPackageId}`,
        {
            method: "GET",
        }
    );

    return response;
}

export function useGetTourPlanDetailsRQ(
    tourPackageId: string
): UseQueryResult<ApiResponse<TourPackage>, Error> {
    return useQuery<ApiResponse<TourPackage>>({
        queryFn: () => getTourPlanDetails(tourPackageId),
        queryKey: ["tour-plans", tourPackageId],
        enabled: !!tourPackageId,
        staleTime: 30_000,
        gcTime: 30_000,
    });
}

async function createTourPlan(data: CreateTourPlanData) {
    const response = await apiFetch<ApiResponse<TourPackage>>(
        "/tour-builder",
        {
            method: "POST",
            body: JSON.stringify(data),
        }
    );

    return response;
}

export function useCreateTourPlanRQ(
    onSuccess?: (data: ApiResponse<TourPackage>) => void,
    onError?: (error: Error) => void
): UseMutationResult<ApiResponse<TourPackage>, Error, CreateTourPlanData> {
    return useMutation<ApiResponse<TourPackage>, Error, CreateTourPlanData>({
        mutationFn: createTourPlan,
        onSuccess,
        onError,
    });
}

async function updateTourPlan(data: UpdateTourPlanData & { id: string }) {
    const { id, ...payload } = data;
    const response = await apiFetch<ApiResponse<TourPackage>>(
        `/tour-builder/${id}`,
        {
            method: "PUT",
            body: JSON.stringify(payload),
        }
    );

    return response;
}

export function useUpdateTourPlanRQ(
    onSuccess?: (data: ApiResponse<TourPackage>) => void,
    onError?: (error: Error) => void
): UseMutationResult<ApiResponse<TourPackage>, Error, UpdateTourPlanData & { id: string }> {
    return useMutation<
        ApiResponse<TourPackage>,
        Error,
        UpdateTourPlanData & { id: string }
    >({
        mutationFn: updateTourPlan,
        onSuccess,
        onError,
    });
}

async function deleteTourPlan(tourPackageId: string) {
    const response = await apiFetch<ApiResponse<{ success: boolean }>>(
        `/tour-builder/${tourPackageId}`,
        {
            method: "DELETE",
        }
    );

    return response;
}

export function useDeleteTourPlanRQ(
    onSuccess?: (data: ApiResponse<{ success: boolean }>) => void,
    onError?: (error: Error) => void
): UseMutationResult<ApiResponse<{ success: boolean }>, Error, string> {
    return useMutation<ApiResponse<{ success: boolean }>, Error, string>({
        mutationFn: deleteTourPlan,
        onSuccess,
        onError,
    });
}

// Aggregate exports as an object
export const TourBuilderApi = {
    useGetAllTourPlansRQ,
    useGetTourPlanDetailsRQ,
    useCreateTourPlanRQ,
    useUpdateTourPlanRQ,
    useDeleteTourPlanRQ,
};
