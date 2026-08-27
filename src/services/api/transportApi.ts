/* eslint-disable @typescript-eslint/no-explicit-any */
import { TransportServiceType } from "@/types/enums";
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from "@tanstack/react-query";
import { unwrapPaginatedList, type PaginatedListResponse } from "@/utilities/adminEntityList";

interface TransportListParams {
    locationId?: string;
    divisionId?: string;
    transportType?: TransportServiceType;
    isActive?: boolean;
    isVerified?: boolean;
    search?: string;
    name?: string;
    page?: number;
    limit?: number;
}

interface TransportSearchParams extends TransportListParams {
    q: string;
}

interface CreateTransportData {
    name: string;
    description: string;
    transportType: TransportServiceType;
    contactEmail: string;
    phoneNumber: string;
    locationId?: string;
    serviceAdminUserId?: string;
    extraPhoneNumbers?: string[];
    website?: string;
    vehicleCount?: number;
    capacity?: number;
    licensePlatePrefix?: string;
    operatingRoutes?: string[];
    amenities?: string[];
    policies?: string[];
    imageURLs?: string[];
}

interface UpdateTransportData {
    description?: string;
    contactEmail?: string;
    phoneNumber?: string;
    extraPhoneNumbers?: string[];
    website?: string;
    locationId?: string;
    vehicleCount?: number;
    capacity?: number;
    licensePlatePrefix?: string;
    operatingRoutes?: string[];
    amenities?: string[];
    policies?: string[];
    imageURLs?: string[];
    imageIdsToDelete?: string[];
}

interface UpdateTransportAdminData extends UpdateTransportData {
    name?: string;
    transportType?: TransportServiceType;
    serviceAdminUserId?: string;
    isActive?: boolean;
    isVerified?: boolean;
}

type PaginatedTransportList = {
    results: Transport[];
    total: number;
    page: number;
    limit: number;
};

function buildQueryString(params?: object) {
    if (!params) return "";

    const searchParams = new URLSearchParams();
    Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
}

async function getAllTransports(params?: TransportListParams | string) {
    const query = typeof params === "string"
        ? (params ? `?${params}` : "")
        : buildQueryString(params);

    const response = await apiFetch<ApiResponse<Transport[] | PaginatedTransportList>>(
        `/transports${query}`,
        { method: "GET" }
    );

    return unwrapPaginatedList<Transport>(response);
}

export function useGetAllTransportsRQ(params?: TransportListParams | string, enabled = true) {
    return useQuery<PaginatedListResponse<Transport>>({
        queryFn: () => getAllTransports(params),
        queryKey: ["transports", params],
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnMount: false,
        enabled,
    });
}

async function searchTransports(params: TransportSearchParams | string) {
    const query = typeof params === "string"
        ? (params ? `?${params}` : "")
        : buildQueryString(params);

    const response = await apiFetch<ApiResponse<Transport[] | PaginatedTransportList>>(
        `/transports/search${query}`,
        { method: "GET" }
    );

    const payload = response.data;
    if (payload && !Array.isArray(payload) && Array.isArray(payload.results)) {
        return { ...response, data: payload.results, total: payload.total, page: payload.page, limit: payload.limit };
    }

    return response;
}

export function useSearchTransportsRQ(params?: TransportSearchParams | string, enabled = true) {
    const hasQuery = typeof params === "string"
        ? params.includes("q=")
        : Boolean(params?.q);

    return useQuery({
        queryFn: () => searchTransports(params as TransportSearchParams | string),
        queryKey: ["transports", "search", params],
        enabled: enabled && hasQuery,
        staleTime: 30_000,
        gcTime: 5 * 60_000,
    });
}

async function getTransportsByLocation(locationId: string) {
    const response = await apiFetch<ApiResponse<Transport[]>>(
        `/transports/location/${locationId}`,
        { method: "GET" }
    );
    return response;
}

export function useGetTransportsByLocationRQ(locationId: string, enabled = true) {
    return useQuery({
        queryFn: () => getTransportsByLocation(locationId),
        queryKey: ["transports", "location", locationId],
        enabled: enabled && !!locationId,
        staleTime: 30_000,
        gcTime: 5 * 60_000,
    });
}

async function getMyTransport() {
    const response = await apiFetch<ApiResponse<Transport | Transport[]>>("/transports/my", {
        method: "GET",
    });
    return response;
}

export function useGetMyTransportRQ(enabled = true) {
    return useQuery({
        queryFn: getMyTransport,
        queryKey: ["transports", "my"],
        enabled,
        staleTime: 30_000,
        gcTime: 30_000,
    });
}

async function getTransportDetail(transportId: string) {
    const response = await apiFetch<ApiResponse<Transport>>(`/transports/${transportId}`, {
        method: "GET",
    });
    return response;
}

export function useGetTransportDetailRQ(transportId: string, enabled = true) {
    return useQuery({
        queryFn: () => getTransportDetail(transportId),
        queryKey: ["transports", transportId],
        enabled: enabled && !!transportId,
        staleTime: 30_000,
        gcTime: 30_000,
    });
}

async function updateTransport(transportData: { id: string } & UpdateTransportData) {
    const { id, ...updateData } = transportData;
    const response = await apiFetch<ApiResponse<Transport>>(`/transports/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
    });
    return response;
}

export function useUpdateTransportRQ(
    onSuccessFn: (response: ApiResponse<Transport>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: updateTransport,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function createTransport(data: CreateTransportData) {
    const response = await apiFetch<ApiResponse<Transport>>("/transports/admin", {
        method: "POST",
        body: JSON.stringify(data),
    });
    return response;
}

export function useCreateTransportRQ(
    onSuccessFn: (response: ApiResponse<Transport>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: createTransport,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function updateTransportAdmin(transportId: string, data: UpdateTransportAdminData) {
    const response = await apiFetch<ApiResponse<Transport>>(`/transports/admin/${transportId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    return response;
}

export function useUpdateTransportAdminRQ(
    onSuccessFn: (response: ApiResponse<Transport>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: ({ transportId, data }: { transportId: string; data: UpdateTransportAdminData }) =>
            updateTransportAdmin(transportId, data),
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function deleteTransport(transportId: string) {
    const response = await apiFetch<ApiResponse<{ message: string }>>(`/transports/${transportId}`, {
        method: "DELETE",
    });
    return response;
}

export function useDeleteTransportRQ(
    onSuccessFn: (response: ApiResponse<{ message: string }>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: deleteTransport,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

export type {
    TransportListParams,
    TransportSearchParams,
    CreateTransportData,
    UpdateTransportData,
    UpdateTransportAdminData,
};

export {
    getAllTransports,
    searchTransports,
    getTransportsByLocation,
    getMyTransport,
    getTransportDetail,
    createTransport,
    updateTransport,
    updateTransportAdmin,
    deleteTransport,
};
export default getAllTransports;
