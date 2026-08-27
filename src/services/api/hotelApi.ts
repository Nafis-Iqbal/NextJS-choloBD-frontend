/* eslint-disable @typescript-eslint/no-explicit-any */
import { HotelType, HotelRoomCategory } from "@/types/enums";
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from "@tanstack/react-query";
import { unwrapPaginatedList, type PaginatedListResponse } from "@/utilities/adminEntityList";

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
    policies?: Category[];
    nearbyAttractions?: string[];
    rating?: number;
    hotelType: HotelType;
    amenities?: Category[];
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
    policies?: Category[];
    nearbyAttractions?: string[];
    rating?: number;
    amenities?: Category[];
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
    const response = await apiFetch<ApiResponse<any>>(
        `/hotels${queryString ? `?${queryString}` : ""}`,
        { method: "GET" }
    );
    return unwrapPaginatedList<any>(response);
}

export function useGetAllHotelsRQ(queryString?: string, enabled = true) {
    return useQuery<PaginatedListResponse<any>>({
        queryFn: () => getAllHotels(queryString),
        queryKey: ["hotels", queryString],
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnMount: false,
        enabled,
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

export async function getHotelDetail(hotelId: string) {
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

export async function getHotelRoomAvailability(hotelId: string, queryString?: string) {
    const response = await apiFetch<ApiResponse<any>>(`/hotels/${hotelId}/availability${queryString ? `?${queryString}` : ""}`, { method: "GET" });
    return response;
}

export function useGetHotelRoomAvailabilityRQ(hotelId: string, queryString?: string) {
    return useQuery<ApiResponse<any>>({
        queryFn: () => getHotelRoomAvailability(hotelId, queryString),
        queryKey: ["hotels", hotelId, queryString],
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

async function updateHotelInfo(
    hotelData: { id: string } & Partial<Omit<Hotel, "id">>
) {
    const {id, ...updateData} = hotelData;
    const response = await apiFetch<ApiResponse<Hotel>>(
        `/hotels/${id}`,
        {
            method: "PUT",
            body: JSON.stringify(updateData),
        }
    );

    return response;
}

export function useUpdateHotelInfoRQ(
    onSuccessFn: (response: any) => void, 
    onErrorFn: () => void
) {
    return useMutation({
        mutationFn: updateHotelInfo,
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        },
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

export { getAllHotels, getPopularHotels };
export default getAllHotels;
