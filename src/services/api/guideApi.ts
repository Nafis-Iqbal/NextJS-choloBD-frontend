/* eslint-disable @typescript-eslint/no-explicit-any */
import { Language, TourType } from "@/types/enums";
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from "@tanstack/react-query";

interface GuideSearchParams {
    q: string;
    locationId?: string;
    specialization?: TourType;
    language?: Language;
    page?: number;
    limit?: number;
}

interface GuideListParams {
    locationId?: string;
    specialization?: TourType;
    language?: Language;
    isActive?: boolean;
    isVerified?: boolean;
    minRating?: number;
    page?: number;
    limit?: number;
}

interface CheckGuideAvailabilityParams {
    bookingDate: string;
    endTime: string;
    startTime?: string;
}

interface CheckGuideAvailabilityResult {
    available: boolean;
    reason?: string;
}

interface CreateGuideData {
    firstName: string;
    lastName: string;
    pricePerDay: number;
    contactEmail: string;
    phoneNumber: string;
    serviceAdminUserId?: string;
    locationId: string;
    bio: string;
    specializations: TourType[];
    languages: Language[];
    experienceYears?: number;
    certificationNumber?: string;
    licenseNumber?: string;
    workingDays: number[];
    workingHoursStart: string;
    workingHoursEnd: string;
    requiresStartTime?: boolean;
    imageURLs?: string[];
}

interface UpdateGuideData {
    bio?: string;
    specializations?: TourType[];
    languages?: Language[];
    experienceYears?: number;
    pricePerDay?: number;
    contactEmail?: string;
    phoneNumber?: string;
    certificationNumber?: string;
    licenseNumber?: string;
    locationId?: string;
    workingDays?: number[];
    workingHoursStart?: string;
    workingHoursEnd?: string;
    requiresStartTime?: boolean;
    imageURLs?: string[];
    imageIdsToDelete?: string[];
}

interface UpdateGuideAdminData extends UpdateGuideData {
    firstName?: string;
    lastName?: string;
    serviceAdminUserId?: string;
    isActive?: boolean;
    isVerified?: boolean;
}

interface UpdateGuideAvailabilityData {
    workingDays?: number[];
    workingHoursStart?: string;
    workingHoursEnd?: string;
    unavailableDates?: string[];
    availabilityStatus?: string;
}

type PaginatedGuideList = {
    results: Guide[];
    total: number;
    page: number;
    limit: number;
};

function buildQueryString(params?: object) {
    if (!params) return "";

    const searchParams = new URLSearchParams();
    Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
}

export async function getAllGuides(params?: GuideListParams) {
    const response = await apiFetch<ApiResponse<Guide[] | PaginatedGuideList>>(
        `/guides${buildQueryString(params)}`,
        { method: "GET" }
    );

    return response;
}

export function useGetAllGuidesRQ(params?: GuideListParams) {
    const queryString = params
        ? new URLSearchParams(
              Object.entries(params)
                  .filter(([, value]) => value !== undefined && value !== null)
                  .map(([key, value]) => [key, String(value)])
          ).toString()
        : undefined;

    return useQuery<ApiResponse<Guide[] | PaginatedGuideList>>({
        queryFn: () => getAllGuides(params),
        queryKey: ["guides", queryString],
        staleTime: queryString ? 0 : 30_000,
        gcTime: 30_000,
        refetchOnMount: queryString ? "always" : false,
    });
}

export async function searchGuides(searchParams: GuideSearchParams) {
    const response = await apiFetch<ApiResponse<Guide[] | PaginatedGuideList>>(
        `/guides/search${buildQueryString(searchParams)}`,
        { method: "GET" }
    );

    return response;
}

export function useSearchGuidesRQ(searchParams?: GuideSearchParams) {
    const queryString = searchParams
        ? new URLSearchParams(
              Object.entries(searchParams)
                  .filter(([, value]) => value !== undefined && value !== null)
                  .map(([key, value]) => [key, String(value)])
          ).toString()
        : undefined;

    return useQuery<ApiResponse<Guide[] | PaginatedGuideList>>({
        queryFn: () => searchGuides(searchParams as GuideSearchParams),
        queryKey: ["guides", "search", queryString],
        staleTime: 0,
        gcTime: 30_000,
        refetchOnMount: "always",
        enabled: !!searchParams?.q?.trim(),
    });
}

export async function getGuidesByLocation(locationId: string) {
    const response = await apiFetch<ApiResponse<Guide[]>>(
        `/guides/location/${locationId}`,
        { method: "GET" }
    );

    return response;
}

export function useGetGuidesByLocationRQ(locationId: string) {
    return useQuery<ApiResponse<Guide[]>>({
        queryFn: () => getGuidesByLocation(locationId),
        queryKey: ["guides", "location", locationId],
        enabled: !!locationId,
        staleTime: 30_000,
        gcTime: 30_000,
    });
}

export async function checkGuideAvailability(
    guideId: string,
    params: CheckGuideAvailabilityParams
) {
    const response = await apiFetch<ApiResponse<CheckGuideAvailabilityResult>>(
        `/guides/${guideId}/availability${buildQueryString(params)}`,
        { method: "GET" }
    );

    return response;
}

export function useCheckGuideAvailabilityRQ(
    guideId: string,
    params?: CheckGuideAvailabilityParams
) {
    const queryString = params
        ? new URLSearchParams(
              Object.entries(params)
                  .filter(([, value]) => value !== undefined && value !== null)
                  .map(([key, value]) => [key, String(value)])
          ).toString()
        : undefined;

    return useQuery<ApiResponse<CheckGuideAvailabilityResult>>({
        queryFn: () => checkGuideAvailability(guideId, params as CheckGuideAvailabilityParams),
        queryKey: ["guides", guideId, "availability", queryString],
        enabled: !!guideId && !!params?.bookingDate && !!params?.endTime,
        staleTime: 0,
        gcTime: 30_000,
        refetchOnMount: "always",
    });
}

export async function getMyGuide() {
    const response = await apiFetch<ApiResponse<Guide>>("/guides/my", {
        method: "GET",
    });

    return response;
}

export function useGetMyGuideRQ(enabled = true) {
    return useQuery<ApiResponse<Guide>>({
        queryFn: getMyGuide,
        queryKey: ["guides", "my"],
        enabled,
        staleTime: 30_000,
        gcTime: 30_000,
    });
}

export async function getGuideDetail(guideId: string) {
    const response = await apiFetch<ApiResponse<Guide>>(`/guides/${guideId}`, {
        method: "GET",
    });

    return response;
}

export function useGetGuideDetailRQ(guideId: string) {
    return useQuery<ApiResponse<Guide>>({
        queryFn: () => getGuideDetail(guideId),
        queryKey: ["guides", guideId],
        enabled: !!guideId,
        staleTime: 30_000,
        gcTime: 30_000,
    });
}

export async function updateGuide(guideData: { id: string } & UpdateGuideData) {
    const { id, ...updateData } = guideData;
    const response = await apiFetch<ApiResponse<Guide>>(`/guides/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
    });

    return response;
}

export function useUpdateGuideRQ(
    onSuccessFn: (response: ApiResponse<Guide>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: updateGuide,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

export async function updateGuideAvailability(
    guideId: string,
    data: UpdateGuideAvailabilityData
) {
    const response = await apiFetch<ApiResponse<Guide>>(
        `/guides/${guideId}/availability`,
        {
            method: "PUT",
            body: JSON.stringify(data),
        }
    );

    return response;
}

export function useUpdateGuideAvailabilityRQ(
    onSuccessFn: (response: ApiResponse<Guide>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: ({
            guideId,
            data,
        }: {
            guideId: string;
            data: UpdateGuideAvailabilityData;
        }) => updateGuideAvailability(guideId, data),
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

export async function createGuide(data: CreateGuideData) {
    const response = await apiFetch<ApiResponse<Guide>>("/guides/admin", {
        method: "POST",
        body: JSON.stringify(data),
    });

    return response;
}

export function useCreateGuideRQ(
    onSuccessFn: (response: ApiResponse<Guide>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: createGuide,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

export async function updateGuideAdmin(
    guideData: { id: string } & UpdateGuideAdminData
) {
    const { id, ...updateData } = guideData;
    const response = await apiFetch<ApiResponse<Guide>>(`/guides/admin/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
    });

    return response;
}

export function useUpdateGuideAdminRQ(
    onSuccessFn: (response: ApiResponse<Guide>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: updateGuideAdmin,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

export async function deleteGuide(guideId: string) {
    const response = await apiFetch<ApiResponse<{ message: string }>>(
        `/guides/${guideId}`,
        { method: "DELETE" }
    );

    return response;
}

export function useDeleteGuideRQ(
    onSuccessFn: (response: ApiResponse<{ message: string }>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: deleteGuide,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

export type {
    GuideSearchParams,
    GuideListParams,
    CheckGuideAvailabilityParams,
    CheckGuideAvailabilityResult,
    CreateGuideData,
    UpdateGuideData,
    UpdateGuideAdminData,
    UpdateGuideAvailabilityData,
    PaginatedGuideList,
};

export default getAllGuides;
