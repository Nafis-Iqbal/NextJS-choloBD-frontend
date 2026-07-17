/* eslint-disable @typescript-eslint/no-explicit-any */
import { BookingStatus, PaymentStatus } from "@/types/enums";
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from "@tanstack/react-query";

interface GetActivityBookingsParams {
    userId?: string;
    activitySpotId?: string;
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
    confirmationCode?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}

interface CreateActivityBookingInput {
    activitySpotId: string;
    userId: string;
    bookingDate: string | Date;
    participantCount: number;
    specialRequirements?: string;
    paymentMethod?: "wallet" | "sslcommerz" | "cash";
    specialRequests?: string;
}

interface UpdateActivityBookingInput {
    bookingDate?: string | Date;
    participantCount?: number;
    specialRequirements?: string;
    paymentMethod?: "wallet" | "sslcommerz" | "cash";
    specialRequests?: string;
}

interface GenerateActivityBookingQrResult {
    qrToken: string;
    expiresAt: string | Date;
}

interface ValidateActivityBookingQrInput {
    qrToken: string;
}

type PaginatedActivityBookingList = {
    data: ActivityBooking[];
    results?: ActivityBooking[];
    total?: number;
    page?: number;
    limit?: number;
    pagination?: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
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

async function getActivityBookings(params?: GetActivityBookingsParams) {
    const response = await apiFetch<ApiResponse<ActivityBooking[] | PaginatedActivityBookingList>>(
        `/bookings/activity-spots${buildQueryString(params)}`,
        { method: "GET" }
    );

    return response;
}

export function useGetActivityBookingsRQ(params?: GetActivityBookingsParams) {
    const queryString = params
        ? new URLSearchParams(
              Object.entries(params)
                  .filter(([, value]) => value !== undefined && value !== null)
                  .map(([key, value]) => [key, String(value)])
          ).toString()
        : undefined;

    return useQuery<ApiResponse<ActivityBooking[] | PaginatedActivityBookingList>>({
        queryFn: () => getActivityBookings(params),
        queryKey: ["activityBookings", queryString],
        staleTime: queryString ? 0 : 30_000,
        gcTime: 30_000,
        refetchOnMount: queryString ? "always" : false,
        enabled: !!params?.userId || !!params?.activitySpotId || !!params?.confirmationCode,
    });
}

async function getActivityBookingDetails(bookingId: string) {
    const response = await apiFetch<ApiResponse<ActivityBooking>>(
        `/bookings/activity-spots/${bookingId}`,
        { method: "GET" }
    );

    return response;
}

export function useGetActivityBookingDetailsRQ(bookingId: string) {
    return useQuery<ApiResponse<ActivityBooking>>({
        queryFn: () => getActivityBookingDetails(bookingId),
        queryKey: ["activityBooking", bookingId],
        staleTime: 30_000,
        gcTime: 30_000,
        enabled: !!bookingId,
    });
}

async function createActivityBooking(bookingData: CreateActivityBookingInput) {
    const response = await apiFetch<ApiResponse<ActivityBooking>>(
        "/bookings/activity-spots",
        {
            method: "POST",
            body: JSON.stringify(bookingData),
        }
    );

    return response;
}

export function useCreateActivityBookingRQ(
    onSuccessFn: (response: ApiResponse<ActivityBooking>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: createActivityBooking,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function updateActivityBooking(
    bookingId: string,
    updateData: UpdateActivityBookingInput
) {
    const response = await apiFetch<ApiResponse<ActivityBooking>>(
        `/bookings/activity-spots/${bookingId}`,
        {
            method: "PUT",
            body: JSON.stringify(updateData),
        }
    );

    return response;
}

export function useUpdateActivityBookingRQ(
    onSuccessFn: (response: ApiResponse<ActivityBooking>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: ({
            bookingId,
            data,
        }: {
            bookingId: string;
            data: UpdateActivityBookingInput;
        }) => updateActivityBooking(bookingId, data),
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function generateActivityBookingQrToken(bookingId: string) {
    const response = await apiFetch<ApiResponse<GenerateActivityBookingQrResult>>(
        `/bookings/activity-spots/${bookingId}/qr-generate`,
        { method: "POST" }
    );

    return response;
}

export function useGenerateActivityBookingQrTokenRQ(
    onSuccessFn: (response: ApiResponse<GenerateActivityBookingQrResult>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: generateActivityBookingQrToken,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function validateActivityBookingQrToken(data: ValidateActivityBookingQrInput) {
    const response = await apiFetch<ApiResponse<{ booking: ActivityBooking }>>(
        "/bookings/activity-spots/qr-scan",
        {
            method: "POST",
            body: JSON.stringify(data),
        }
    );

    return response;
}

export function useValidateActivityBookingQrTokenRQ(
    onSuccessFn: (response: ApiResponse<{ booking: ActivityBooking }>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: validateActivityBookingQrToken,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function cancelActivityBooking(
    bookingId: string,
    reason?: string
) {
    const response = await apiFetch<ApiResponse<{ message: string }>>(
        `/bookings/activity-spots/${bookingId}`,
        {
            method: "DELETE",
            body: reason ? JSON.stringify({ reason }) : undefined,
        }
    );

    return response;
}

export function useCancelActivityBookingRQ(
    onSuccessFn: (response: ApiResponse<{ message: string }>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: ({
            bookingId,
            reason,
        }: {
            bookingId: string;
            reason?: string;
        }) => cancelActivityBooking(bookingId, reason),
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

export type {
    GetActivityBookingsParams,
    CreateActivityBookingInput,
    UpdateActivityBookingInput,
    GenerateActivityBookingQrResult,
    ValidateActivityBookingQrInput,
    PaginatedActivityBookingList,
};

export default getActivityBookings;
