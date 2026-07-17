/* eslint-disable @typescript-eslint/no-explicit-any */
import { BookingStatus } from "@/types/enums";
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from "@tanstack/react-query";

type GuideBookingStatus = BookingStatus | "ACCEPTED" | "DECLINED";

type GuideBookingStatusAction = "accept" | "decline" | "complete" | "cancel";

interface CreateGuideBookingInput {
  guideId: string;
  userId: string;
  bookingDate: string | Date;
  startTime?: string | Date;
  endTime: string | Date;
  travelerCount: number;
  specialRequirements?: string;
  paymentMethod?: "wallet" | "sslcommerz" | "cash";
  specialRequests?: string;
}

interface UpdateGuideBookingStatusInput {
  action: GuideBookingStatusAction;
  reason?: string;
}

type PaginatedList<T> = {
  results: T[];
  total?: number;
  page?: number;
  limit?: number;
};

async function getGuideBookings(queryString?: string) {
  const response = await apiFetch<ApiResponse<GuideBooking[] | PaginatedList<GuideBooking>>>(
    `/bookings/guides${queryString ? `?${queryString}` : ""}`,
    { method: "GET" }
  );
  return response;
}

export function useGetGuideBookingsRQ(queryString?: string) {
  return useQuery<ApiResponse<GuideBooking[] | PaginatedList<GuideBooking>>>({
    queryFn: () => getGuideBookings(queryString),
    queryKey: ["guideBookings", queryString],
    staleTime: queryString ? 0 : 30_000,
    gcTime: 30_000,
    refetchOnMount: queryString ? "always" : false,
  });
}

async function getGuideBookingDetails(bookingId: string) {
  const response = await apiFetch<ApiResponse<GuideBooking>>(
    `/bookings/guides/${bookingId}`,
    { method: "GET" }
  );
  return response;
}

export function useGetGuideBookingDetailsRQ(bookingId: string) {
  return useQuery<ApiResponse<GuideBooking>>({
    queryFn: () => getGuideBookingDetails(bookingId),
    queryKey: ["guideBooking", bookingId],
    staleTime: 30_000,
    gcTime: 30_000,
    enabled: !!bookingId,
  });
}

async function createGuideBooking(bookingData: CreateGuideBookingInput) {
  const response = await apiFetch<ApiResponse<GuideBooking>>(
    "/bookings/guides",
    {
      method: "POST",
      body: JSON.stringify(bookingData),
    }
  );
  return response;
}

export function useCreateGuideBookingRQ(
  onSuccessFn: (response: ApiResponse<GuideBooking>) => void,
  onErrorFn: (error: any) => void
) {
  return useMutation({
    mutationFn: createGuideBooking,
    onSuccess: (data) => {
      onSuccessFn(data);
    },
    onError: (error) => {
      onErrorFn(error);
    },
  });
}

async function updateGuideBookingStatus(
  bookingId: string,
  data: UpdateGuideBookingStatusInput
) {
  const response = await apiFetch<ApiResponse<GuideBooking>>(
    `/bookings/guides/${bookingId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
  return response;
}

export function useUpdateGuideBookingStatusRQ(
  onSuccessFn: (response: ApiResponse<GuideBooking>) => void,
  onErrorFn: (error: any) => void
) {
  return useMutation({
    mutationFn: ({
      bookingId,
      data,
    }: {
      bookingId: string;
      data: UpdateGuideBookingStatusInput;
    }) => updateGuideBookingStatus(bookingId, data),
    onSuccess: (data) => {
      onSuccessFn(data);
    },
    onError: (error) => {
      onErrorFn(error);
    },
  });
}

export type {
  GuideBookingStatus,
  GuideBookingStatusAction,
  CreateGuideBookingInput,
  UpdateGuideBookingStatusInput,
};

export default getGuideBookings;
