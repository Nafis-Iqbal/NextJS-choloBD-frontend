/* eslint-disable @typescript-eslint/no-explicit-any */
import { HotelType } from "@/types/enums";
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from "@tanstack/react-query";

interface HotelSearchParams {
    name?: string;
    locationId?: string;
    hotelType?: HotelType;
    minRating?: number;
    maxRating?: number;
    isActive?: boolean;
    limit?: number;
    offset?: number;
}

interface CreateHotelData {
    name: string;
    description?: string;
    locationId: string;
    addressId?: string;
    phoneNumber?: string;
    email?: string;
    website?: string;
    totalRooms?: number;
    availableRooms?: number;
    policies?: any;
    nearbyAttractions?: string[];
    rating?: number;
    hotelType: HotelType;
    amenities?: string[];
    checkInTime?: string;
    checkOutTime?: string;
    isActive?: boolean;
}

interface UpdateHotelData {
    description?: string;
    phoneNumber?: string;
    email?: string;
    website?: string;
    totalRooms?: number;
    availableRooms?: number;
    policies?: any;
    nearbyAttractions?: string[];
    rating?: number;
    amenities?: string[];
    checkInTime?: string;
    checkOutTime?: string;
    isActive?: boolean;
}

interface UpdateHotelCoreData {
    name?: string;
    locationId?: string;
    addressId?: string;
    hotelType?: HotelType;
}

async function getAllHotels(queryString?: string) {
    const response = await apiFetch<ApiResponse<any[]>>(
        `/hotels${queryString ? `?${queryString}` : ""}`,
        { method: "GET" }
    );
    return response;
}

export function useGetAllHotelsRQ(queryString?: string) {
    return useQuery<ApiResponse<any[]>>({
        queryFn: () => getAllHotels(queryString),
        queryKey: ["hotels", queryString],
        staleTime: queryString ? 0 : 30_000,
        gcTime: 30_000,
        refetchOnMount: queryString ? "always" : false,
    });
}

async function getPopularHotels() {
    const response = await apiFetch<ApiResponse<any[]>>("/hotels/popular", { method: "GET" });
    return response;
}

export function useGetPopularHotelsRQ() {
    return useQuery<ApiResponse<any[]>>({
        queryFn: getPopularHotels,
        queryKey: ["hotels", "popular"],
        staleTime: 5 * 60_000,
        gcTime: 10 * 60_000,
    });
}

async function searchHotels(searchParams: HotelSearchParams) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.append(key, String(value));
        }
    });

    const queryString = params.toString();
    const response = await apiFetch<ApiResponse<any[]>>(
        `/hotels/search${queryString ? `?${queryString}` : ""}`,
        { method: "GET" }
    );
    return response;
}

export function useSearchHotelsRQ(searchParams?: HotelSearchParams) {
    const queryString = searchParams
        ? new URLSearchParams(
              Object.entries(searchParams)
                  .filter(([, v]) => v !== undefined && v !== null)
                  .map(([k, v]) => [k, String(v)])
          ).toString()
        : undefined;

    return useQuery<ApiResponse<any[]>>({
        queryFn: () => searchHotels(searchParams || {}),
        queryKey: ["hotels", "search", queryString],
        staleTime: queryString ? 0 : 30_000,
        gcTime: 30_000,
        refetchOnMount: queryString ? "always" : false,
        enabled: !!searchParams && Object.keys(searchParams).length > 0,
    });
}

async function getHotelsByLocation(locationId: string) {
    const response = await apiFetch<ApiResponse<any[]>>(`/hotels/location/${locationId}`, {
        method: "GET",
    });
    return response;
}

export function useGetHotelsByLocationRQ(locationId: string) {
    return useQuery<ApiResponse<any[]>>({
        queryFn: () => getHotelsByLocation(locationId),
        queryKey: ["hotels", "location", locationId],
        enabled: !!locationId,
        staleTime: 30_000,
        gcTime: 30_000,
    });
}

async function getHotelDetail(hotelId: string) {
    const response = await apiFetch<ApiResponse<any>>(`/hotels/${hotelId}`, { method: "GET" });
    return response;
}

export function useGetHotelDetailRQ(hotelId: string) {
    return useQuery<ApiResponse<any>>({
        queryFn: () => getHotelDetail(hotelId),
        queryKey: ["hotels", hotelId],
        enabled: !!hotelId,
        staleTime: 30_000,
        gcTime: 30_000,
    });
}

async function createHotel(data: CreateHotelData) {
    const response = await apiFetch<ApiResponse<any>>(`/hotels/admin`, {
        method: "POST",
        body: JSON.stringify(data),
    });
    return response;
}

export function useCreateHotelRQ(onSuccessFn: (res: any) => void, onErrorFn: () => void) {
    return useMutation({
        mutationFn: createHotel,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function updateHotelInfo(hotelId: string, data: UpdateHotelData) {
    const response = await apiFetch<ApiResponse<any>>(`/hotels/${hotelId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    return response;
}

export function useUpdateHotelInfoRQ(onSuccessFn: (res: any) => void, onErrorFn: () => void) {
    return useMutation({
        mutationFn: ({ hotelId, data }: { hotelId: string; data: UpdateHotelData }) =>
            updateHotelInfo(hotelId, data),
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function updateHotelCoreInfo(hotelId: string, data: UpdateHotelCoreData) {
    const response = await apiFetch<ApiResponse<any>>(`/hotels/admin/${hotelId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    return response;
}

export function useUpdateHotelCoreInfoRQ(onSuccessFn: (res: any) => void, onErrorFn: () => void) {
    return useMutation({
        mutationFn: ({ hotelId, data }: { hotelId: string; data: UpdateHotelCoreData }) =>
            updateHotelCoreInfo(hotelId, data),
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function deleteHotel(hotelId: string) {
    const response = await apiFetch<ApiResponse<{ message: string }>>(`/hotels/${hotelId}`, {
        method: "DELETE",
    });
    return response;
}

export function useDeleteHotelRQ(onSuccessFn: (res: any) => void, onErrorFn: () => void) {
    return useMutation({
        mutationFn: deleteHotel,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function deleteHotelImages(hotelId: string, imageIds: string[]) {
    const response = await apiFetch<ApiResponse<{ message: string }>>(
        `/hotels/${hotelId}/images`,
        {
            method: "PUT",
            body: JSON.stringify({ imageIds })
        }
    );

    return response;
}

export function useDeleteHotelImagesRQ(
    onSuccessFn: (response: any) => void,
    onErrorFn: () => void
) {
    return useMutation({
        mutationFn: ({
            hotelId,
            imageIds,
        }: {
            hotelId: string;
            imageIds: string[];
        }) => deleteHotelImages(hotelId, imageIds),
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        },
    });
}

export type {
    HotelSearchParams,
    CreateHotelData,
    UpdateHotelData,
    UpdateHotelCoreData,
};

export default getAllHotels;
