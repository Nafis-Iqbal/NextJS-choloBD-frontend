/* eslint-disable @typescript-eslint/no-explicit-any */
import { HotelType, HotelRoomCategory, HotelRoomStatus } from "@/types/enums";
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from "@tanstack/react-query";

interface CreateHotelRoomTypeData {
    roomType: HotelRoomCategory;
    singleBedCount: number;
    doubleBedCount: number;
    pricePerNight: number;
    isAvailable?: boolean;
}

interface UpdateHotelRoomTypeData {
    roomType?: HotelRoomCategory;
    singleBedCount?: number;
    doubleBedCount?: number;
    pricePerNight?: number;
    isAvailable?: boolean;
}

interface UpdateHotelRoomData {
    roomStatus: HotelRoomStatus;
}

async function createHotelRoomType(data: CreateHotelRoomTypeData) {
    const response = await apiFetch<ApiResponse<HotelRoom>>(`/hotel-rooms/roomTypes`, {
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

async function updateHotelRoomTypeAdmin(roomTypeId: string, data: UpdateHotelRoomTypeData) {
    const response = await apiFetch<ApiResponse<HotelRoom>>(`/hotel-rooms/roomTypes/${roomTypeId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    return response;
}

export function useUpdateHotelRoomTypeAdminRQ(onSuccessFn: (res: any) => void, onErrorFn: () => void) {
    return useMutation({
        mutationFn: ({ roomTypeId, data }: { roomTypeId: string, data: UpdateHotelRoomTypeData }) =>
            updateHotelRoomTypeAdmin(roomTypeId, data),
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
