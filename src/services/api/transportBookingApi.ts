/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from "@tanstack/react-query";

interface BusSeatPassenger {
    seatId: string;
    passengerName?: string;
    passengerAge?: number;
    passengerDocument?: string;
}

interface CreateTransportBookingInput {
    transportId: string;
    transportTripId?: string;
    seatIds?: string[];
    passengers?: BusSeatPassenger[];
    transportVehicleId?: string;
    departureDateTime?: string;
    arrivalDateTime?: string;
    paymentMethod?: string;
    specialRequests?: string;
}

interface GetTransportBookingsParams {
    userId?: string;
    transportId?: string;
    status?: string;
    paymentStatus?: string;
    confirmationCode?: string;
    page?: number;
    limit?: number;
}

type PaginatedTransportBookingList = {
    results: TransportBooking[];
    total: number;
    page: number;
    limit: number;
};

function buildQueryString(params?: object | string) {
    if (!params) return "";
    if (typeof params === "string") return params ? `?${params}` : "";

    const searchParams = new URLSearchParams();
    Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
}

async function getTransportBookings(params?: GetTransportBookingsParams | string) {
    const response = await apiFetch<ApiResponse<TransportBooking[] | PaginatedTransportBookingList>>(
        `/bookings/transports${buildQueryString(params)}`,
        { method: "GET" }
    );

    const payload = response.data;
    if (payload && !Array.isArray(payload) && Array.isArray(payload.results)) {
        return { ...response, data: payload.results, total: payload.total, page: payload.page, limit: payload.limit };
    }

    return response;
}

export function useGetTransportBookingsRQ(params?: GetTransportBookingsParams | string) {
    return useQuery({
        queryFn: () => getTransportBookings(params),
        queryKey: ["transportBookings", params],
        staleTime: params ? 0 : 30_000,
        gcTime: 30_000,
        refetchOnMount: params ? "always" : false,
    });
}

async function getTransportBookingDetails(bookingId: string) {
    const response = await apiFetch<ApiResponse<TransportBooking>>(
        `/bookings/transports/${bookingId}`,
        { method: "GET" }
    );
    return response;
}

export function useGetTransportBookingDetailsRQ(bookingId: string, enabled = true) {
    return useQuery({
        queryFn: () => getTransportBookingDetails(bookingId),
        queryKey: ["transportBooking", bookingId],
        enabled: enabled && !!bookingId,
        staleTime: 30_000,
        gcTime: 30_000,
    });
}

async function createTransportBooking(bookingData: CreateTransportBookingInput) {
    const response = await apiFetch<ApiResponse<TransportBooking>>("/bookings/transports", {
        method: "POST",
        body: JSON.stringify(bookingData),
    });
    return response;
}

export function useCreateTransportBookingRQ(
    onSuccessFn: (response: ApiResponse<TransportBooking>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: createTransportBooking,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function cancelTransportBooking(bookingId: string, cancellationReason?: string) {
    const response = await apiFetch<ApiResponse<TransportBooking>>(
        `/bookings/transports/${bookingId}`,
        {
            method: "DELETE",
            body: cancellationReason ? JSON.stringify({ cancellationReason }) : undefined,
        }
    );
    return response;
}

export function useCancelTransportBookingRQ(
    onSuccessFn: (response: ApiResponse<TransportBooking>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: ({
            bookingId,
            cancellationReason,
        }: {
            bookingId: string;
            cancellationReason?: string;
        }) => cancelTransportBooking(bookingId, cancellationReason),
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

export type {
    BusSeatPassenger,
    CreateTransportBookingInput,
    GetTransportBookingsParams,
};

export { getTransportBookings, getTransportBookingDetails, createTransportBooking, cancelTransportBooking };
export default getTransportBookings;
