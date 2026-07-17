/* eslint-disable @typescript-eslint/no-explicit-any */
import { HotelRoomCategory, HotelRoomStatus } from "@/types/enums";
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from "@tanstack/react-query";

interface CreateHotelRoomTypeData {
    hotelId: string;
    roomType: HotelRoomCategory;
    singleBedCount: number;
    doubleBedCount: number;
    pricePerNight: number;
    totalCount?: number;
    availableCount?: number;
    imageURLs?: string[];
}

interface UpdateHotelRoomTypeData {
    roomType?: HotelRoomCategory;
    singleBedCount?: number;
    doubleBedCount?: number;
    pricePerNight?: number;
    totalCount?: number;
    availableCount?: number;
    imageURLs?: string[];
}

interface UpdateHotelRoomData {
    roomStatus: HotelRoomStatus;
}

async function createHotelRoomType(data: CreateHotelRoomTypeData) {
    const response = await apiFetch<ApiResponse<HotelRoomType>>(`/hotel-rooms/roomTypes`, {
        method: "POST",
        body: JSON.stringify(data),
    });
    return response;
}

export function useCreateHotelRoomTypeRQ(onSuccessFn: (res: any) => void, onErrorFn: () => void) {
    return useMutation({
        mutationFn: ({ data }: { data: CreateHotelRoomTypeData }) =>
            createHotelRoomType(data),
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function updateHotelRoomTypeAdmin(
    roomTypeData: { id: string } & UpdateHotelRoomTypeData
) {
    const { id, ...updateData } = roomTypeData;
    const response = await apiFetch<ApiResponse<HotelRoomType>>(`/hotel-rooms/roomTypes/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
    });
    return response;
}

export function useUpdateHotelRoomTypeAdminRQ(onSuccessFn: (res: any) => void, onErrorFn: () => void) {
    return useMutation({
        mutationFn: updateHotelRoomTypeAdmin,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function deleteHotelRoomTypeImages(roomTypeId: string, imageIds: string[]) {
    const response = await apiFetch<ApiResponse<{ message: string }>>(
        `/hotel-rooms/roomTypes/${roomTypeId}/images`,
        {
            method: "PUT",
            body: JSON.stringify({ imageIds }),
        }
    );
    return response;
}

export function useDeleteHotelRoomTypeImagesRQ(
    onSuccessFn: (response: any) => void,
    onErrorFn: () => void
) {
    return useMutation({
        mutationFn: ({
            roomTypeId,
            imageIds,
        }: {
            roomTypeId: string;
            imageIds: string[];
        }) => deleteHotelRoomTypeImages(roomTypeId, imageIds),
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function updateHotelRoom(roomId: string, data: UpdateHotelRoomData) {
    const response = await apiFetch<ApiResponse<HotelRoom>>(`/hotel-rooms/rooms/${roomId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    return response;
}

export function useUpdateHotelRoomRQ(onSuccessFn: (res: any) => void, onErrorFn: () => void) {
    return useMutation({
        mutationFn: ({ roomId, data }: { roomId: string; data: UpdateHotelRoomData }) =>
            updateHotelRoom(roomId, data),
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function getHotelRooms(hotelId: string) {
    const response = await apiFetch<ApiResponse<HotelRoom[]>>(`/hotel-rooms/rooms/${hotelId}`, {
        method: "GET",
    });
    return response;
}

export function useGetHotelRoomsRQ(hotelId: string) {
    return useQuery<ApiResponse<HotelRoom[]>>({
        queryFn: () => getHotelRooms(hotelId),
        queryKey: ["hotel-rooms", hotelId],
        enabled: !!hotelId,
        staleTime: 30_000,
        gcTime: 30_000,
    });
}

export type {
    CreateHotelRoomTypeData,
    UpdateHotelRoomTypeData,
    UpdateHotelRoomData,
};

export { getHotelRooms };
