/* eslint-disable @typescript-eslint/no-explicit-any */
import { BookingStatus } from "@/types/enums";
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from '@tanstack/react-query';

// Input interfaces for creating and updating HotelRoomBooking
// Note: HotelRoomBooking itself comes from global.d.ts

interface CreateHotelRoomBookingInput {
  hotelId: string;
  userId: string;
  checkInDate: string | Date;
  checkOutDate: string | Date;
  shift?: string;
  totalPrice: number;
  paymentMethod?: string;
  specialRequests?: string;
  // Selected room types and their quantities (roomTypeId -> quantity)
  selectedRoomsMap: Record<string, number>;
  // Guest contact information
  guestName: string;
  guestEmail: string;
  guestPhoneNumber: string;
}

interface UpdateHotelRoomBookingInput {
  checkInDate?: string | Date;
  checkOutDate?: string | Date;
  totalPrice?: number;
  status?: BookingStatus;
  paymentMethod?: string;
  specialRequests?: string;
  cancellationReason?: string;
}

// API Methods

type PaginatedList<T> = {
  data: T[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

async function getBookings(queryString?: string) {
  const response = await apiFetch<ApiResponse<HotelRoomBooking[] | PaginatedList<HotelRoomBooking>>>(
    `/bookings/hotel-rooms${queryString ? `?${queryString}` : ""}`,
    { method: "GET" }
  );
  return response;
}

export function useGetBookingsRQ(queryString?: string) {
  return useQuery<ApiResponse<HotelRoomBooking[] | PaginatedList<HotelRoomBooking>>>({
    queryFn: () => getBookings(queryString),
    queryKey: ["hotelBookings", queryString],
    staleTime: queryString ? 0 : 30_000,
    gcTime: 30_000,
    refetchOnMount: queryString ? "always" : false,
  });
}

async function getBookingDetails(bookingId: string) {
  const response = await apiFetch<ApiResponse<HotelRoomBooking>>(
    `/bookings/hotel-rooms/${bookingId}`,
    { method: "GET" }
  );
  return response;
}

export function useGetBookingDetailsRQ(bookingId: string) {
  return useQuery<ApiResponse<HotelRoomBooking>>({
    queryFn: () => getBookingDetails(bookingId),
    queryKey: ["hotelBooking", bookingId],
    staleTime: 30_000,
    gcTime: 30_000,
    enabled: !!bookingId,
  });
}

async function createBooking(bookingData: CreateHotelRoomBookingInput) {
  const response = await apiFetch<ApiResponse<HotelRoomBooking>>(
    "/bookings/hotel-rooms",
    {
      method: "POST",
      body: JSON.stringify(bookingData),
    }
  );
  return response;
}

export function useCreateBookingRQ(
  onSuccessFn: (response: ApiResponse<HotelRoomBooking>) => void,
  onErrorFn: (error: any) => void
) {
  return useMutation({
    mutationFn: createBooking,
    onSuccess: (data) => {
      onSuccessFn(data);
    },
    onError: (error) => {
      onErrorFn(error);
    },
  });
}

async function updateBooking(
  bookingId: string,
  updateData: UpdateHotelRoomBookingInput
) {
  const response = await apiFetch<ApiResponse<HotelRoomBooking>>(
    `/bookings/hotel-rooms/${bookingId}`,
    {
      method: "PUT",
      body: JSON.stringify(updateData),
    }
  );
  return response;
}

export function useUpdateBookingRQ(
  onSuccessFn: (response: ApiResponse<HotelRoomBooking>) => void,
  onErrorFn: () => void
) {
  return useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: UpdateHotelRoomBookingInput }) =>
      updateBooking(bookingId, data),
    onSuccess: (data) => {
      onSuccessFn(data);
    },
    onError: () => {
      onErrorFn();
    },
  });
}

async function cancelBooking(bookingId: string) {
  const response = await apiFetch<ApiResponse<{ success: boolean }>>(
    `/bookings/hotel-rooms/${bookingId}`,
    {
      method: "DELETE",
    }
  );
  return response;
}

export function useCancelBookingRQ(
  onSuccessFn: (response: ApiResponse<{ success: boolean }>) => void,
  onErrorFn: () => void
) {
  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: (data) => {
      onSuccessFn(data);
    },
    onError: () => {
      onErrorFn();
    },
  });
}

export type {
  CreateHotelRoomBookingInput,
  UpdateHotelRoomBookingInput,
};

export default getBookings;
