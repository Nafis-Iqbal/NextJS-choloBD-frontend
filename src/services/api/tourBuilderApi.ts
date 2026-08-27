/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { unwrapPaginatedList, type PaginatedListResponse } from "@/utilities/adminEntityList";

interface TourDaySegmentPayload {
    dayNumber: number;
    segmentOrder?: number;
    shortDescription: string;
    tourSpotId?: string;
    activitySpotId?: string;
    transportOption?: string;
    hotelOption?: string;
    hotelId?: string;
    transportId?: string;
    notes?: string;
}

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
    imageURLs?: string[];
    daySegments: TourDaySegmentPayload[];
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
    imageURLs?: string[];
    daySegments?: TourDaySegmentPayload[];
    startDate?: string;
    endDate?: string;
    status?: string;
    estimatedBudget?: number;
    actualCost?: number;
    participantCount?: number;
    preferredHotelType?: string;
    preferredTransport?: string;
    generalNotes?: string[];
    isPublic?: boolean;
}

interface CreatePersonalTourPlanData {
    packageName?: string;
    shortDescription?: string;
    tourType?: string;
    locationId?: string;
    startDate: string;
    endDate: string;
    estimatedBudget?: number;
    participantCount?: number;
    preferredHotelType?: string;
    preferredTransport?: string;
    basedOnPackageId?: string;
    generalNotes?: string[];
    totalBudget?: number;
    imageURLs?: string[];
    daySegments?: TourDaySegmentPayload[];
}

type UpdatePersonalTourPlanData = UpdateTourPlanData;

interface PersonalTourPlansPagination {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

type PersonalTourPlansResponse = ApiResponse<TourPackage[]> & {
    pagination?: PersonalTourPlansPagination;
};

export async function getAllTourPlans(queryString?: string) {
    const response = await apiFetch<ApiResponse<any>>(
        `/tour-builder${queryString ? `?${queryString}` : ""}`,
        {
            method: "GET",
        }
    );

    return unwrapPaginatedList<TourPackage>(response);
}

export function useGetAllTourPlansRQ(
    queryString?: string
): UseQueryResult<PaginatedListResponse<TourPackage>, Error> {
    return useQuery<PaginatedListResponse<TourPackage>>({
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

export async function getPersonalTourPlans(queryString?: string) {
    const response = await apiFetch<PersonalTourPlansResponse>(
        `/tour-builder/my${queryString ? `?${queryString}` : ""}`,
        {
            method: "GET",
        }
    );

    return response;
}

export function useGetPersonalTourPlansRQ(
    queryString?: string
): UseQueryResult<PersonalTourPlansResponse, Error> {
    return useQuery<PersonalTourPlansResponse>({
        queryFn: () => getPersonalTourPlans(queryString),
        queryKey: ["personal-tour-plans", queryString],
        staleTime: queryString ? 0 : 30_000,
        gcTime: 30_000,
        refetchOnMount: queryString ? "always" : false,
    });
}

async function getPersonalTourPlanDetails(tourPackageId: string) {
    const response = await apiFetch<ApiResponse<TourPackage>>(
        `/tour-builder/my/${tourPackageId}`,
        {
            method: "GET",
        }
    );

    return response;
}

export function useGetPersonalTourPlanDetailsRQ(
    tourPackageId: string
): UseQueryResult<ApiResponse<TourPackage>, Error> {
    return useQuery<ApiResponse<TourPackage>>({
        queryFn: () => getPersonalTourPlanDetails(tourPackageId),
        queryKey: ["personal-tour-plans", tourPackageId],
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

async function createPersonalTourPlan(data: CreatePersonalTourPlanData) {
    const response = await apiFetch<ApiResponse<TourPackage>>(
        "/tour-builder/my",
        {
            method: "POST",
            body: JSON.stringify(data),
        }
    );

    return response;
}

export function useCreatePersonalTourPlanRQ(
    onSuccess?: (data: ApiResponse<TourPackage>) => void,
    onError?: (error: Error) => void
): UseMutationResult<ApiResponse<TourPackage>, Error, CreatePersonalTourPlanData> {
    return useMutation<ApiResponse<TourPackage>, Error, CreatePersonalTourPlanData>({
        mutationFn: createPersonalTourPlan,
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

async function updatePersonalTourPlan(data: UpdatePersonalTourPlanData & { id: string }) {
    const { id, ...payload } = data;
    const response = await apiFetch<ApiResponse<TourPackage>>(
        `/tour-builder/my/${id}`,
        {
            method: "PUT",
            body: JSON.stringify(payload),
        }
    );

    return response;
}

export function useUpdatePersonalTourPlanRQ(
    onSuccess?: (data: ApiResponse<TourPackage>) => void,
    onError?: (error: Error) => void
): UseMutationResult<ApiResponse<TourPackage>, Error, UpdatePersonalTourPlanData & { id: string }> {
    return useMutation<
        ApiResponse<TourPackage>,
        Error,
        UpdatePersonalTourPlanData & { id: string }
    >({
        mutationFn: updatePersonalTourPlan,
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

async function deletePersonalTourPlan(tourPackageId: string) {
    const response = await apiFetch<ApiResponse<{ success: boolean }>>(
        `/tour-builder/my/${tourPackageId}`,
        {
            method: "DELETE",
        }
    );

    return response;
}

export function useDeletePersonalTourPlanRQ(
    onSuccess?: (data: ApiResponse<{ success: boolean }>) => void,
    onError?: (error: Error) => void
): UseMutationResult<ApiResponse<{ success: boolean }>, Error, string> {
    return useMutation<ApiResponse<{ success: boolean }>, Error, string>({
        mutationFn: deletePersonalTourPlan,
        onSuccess,
        onError,
    });
}

async function deleteTourPlanImages(tourPackageId: string, imageIds: string[]) {
    const response = await apiFetch<ApiResponse<{ message: string }>>(
        `/tour-builder/${tourPackageId}/images`,
        {
            method: "PUT",
            body: JSON.stringify({ imageIds }),
        }
    );

    return response;
}

export function useDeleteTourPlanImagesRQ(
    onSuccess?: (data: ApiResponse<{ message: string }>) => void,
    onError?: (error: Error) => void
): UseMutationResult<
    ApiResponse<{ message: string }>,
    Error,
    { tourPackageId: string; imageIds: string[] }
> {
    return useMutation({
        mutationFn: ({
            tourPackageId,
            imageIds,
        }: {
            tourPackageId: string;
            imageIds: string[];
        }) => deleteTourPlanImages(tourPackageId, imageIds),
        onSuccess,
        onError,
    });
}

async function deletePersonalTourPlanImages(tourPackageId: string, imageIds: string[]) {
    const response = await apiFetch<ApiResponse<{ message: string }>>(
        `/tour-builder/my/${tourPackageId}/images`,
        {
            method: "PUT",
            body: JSON.stringify({ imageIds }),
        }
    );

    return response;
}

export function useDeletePersonalTourPlanImagesRQ(
    onSuccess?: (data: ApiResponse<{ message: string }>) => void,
    onError?: (error: Error) => void
): UseMutationResult<
    ApiResponse<{ message: string }>,
    Error,
    { tourPackageId: string; imageIds: string[] }
> {
    return useMutation({
        mutationFn: ({
            tourPackageId,
            imageIds,
        }: {
            tourPackageId: string;
            imageIds: string[];
        }) => deletePersonalTourPlanImages(tourPackageId, imageIds),
        onSuccess,
        onError,
    });
}

// Aggregate exports as an object
export const TourBuilderApi = {
    getAllTourPlans,
    useGetAllTourPlansRQ,
    useGetTourPlanDetailsRQ,
    useCreateTourPlanRQ,
    useUpdateTourPlanRQ,
    useDeleteTourPlanRQ,
    useDeleteTourPlanImagesRQ,
    getPersonalTourPlans,
    useGetPersonalTourPlansRQ,
    useGetPersonalTourPlanDetailsRQ,
    useCreatePersonalTourPlanRQ,
    useUpdatePersonalTourPlanRQ,
    useDeletePersonalTourPlanRQ,
    useDeletePersonalTourPlanImagesRQ,
};
