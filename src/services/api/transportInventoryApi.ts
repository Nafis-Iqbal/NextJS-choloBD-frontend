/* eslint-disable @typescript-eslint/no-explicit-any */
import { BusServiceType, HotelRoomStatus, VehicleRentalCategory } from "@/types/enums";
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from "@tanstack/react-query";

interface CreateTransportClassData {
    transportId: string;
    name: string;
    basePrice: number;
    busServiceType?: BusServiceType;
    vehicleRentalCategory?: VehicleRentalCategory;
}

interface UpdateTransportClassData {
    name?: string;
    basePrice?: number;
    busServiceType?: BusServiceType;
    vehicleRentalCategory?: VehicleRentalCategory;
    isActive?: boolean;
}

interface CreateRouteStopData {
    locationId: string;
    name: string;
    stopOrder: number;
    arrivalOffsetMinutes?: number;
}

interface CreateTransportRouteData {
    transportId: string;
    originLocationId: string;
    destinationLocationId: string;
    name?: string;
    stops?: CreateRouteStopData[];
}

interface UpdateTransportRouteData {
    originLocationId?: string;
    destinationLocationId?: string;
    name?: string;
    isActive?: boolean;
}

interface LayoutSeatInput {
    seatLabel: string;
    transportClassId: string;
    rowLabel?: string;
    columnLabel?: string;
}

interface CreateTransportLayoutData {
    transportId: string;
    name: string;
    transportClassId?: string;
    seatCount?: number;
    seats?: LayoutSeatInput[];
    compartmentName?: string;
}

interface CreateTransportTripData {
    transportId: string;
    transportRouteId: string;
    layoutId: string;
    departureDateTime: string;
    arrivalDateTime: string;
}

interface UpdateTransportTripData {
    departureDateTime?: string;
    arrivalDateTime?: string;
    isActive?: boolean;
}

interface CreateTransportVehicleData {
    transportId: string;
    transportClassId: string;
    name?: string;
    licensePlate?: string;
    vehicleStatus?: HotelRoomStatus;
}

interface UpdateTransportVehicleData {
    name?: string;
    licensePlate?: string;
    transportClassId?: string;
    vehicleStatus?: HotelRoomStatus;
    isActive?: boolean;
}

interface GetRoutesParams {
    transportId?: string;
    originLocationId?: string;
    destinationLocationId?: string;
}

interface GetTripsParams {
    transportId?: string;
    originLocationId?: string;
    destinationLocationId?: string;
    departureDate?: string;
}

interface GetVehiclesParams {
    transportId: string;
    transportClassId?: string;
    checkInDate?: string;
    checkOutDate?: string;
}

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

async function getTransportClasses(transportId: string) {
    const response = await apiFetch<ApiResponse<TransportClass[]>>(
        `/transport-inventory/classes${buildQueryString({ transportId })}`,
        { method: "GET" }
    );
    return response;
}

export function useGetTransportClassesRQ(transportId: string, enabled = true) {
    return useQuery({
        queryFn: () => getTransportClasses(transportId),
        queryKey: ["transport-inventory", "classes", transportId],
        enabled: enabled && !!transportId,
        staleTime: 30_000,
        gcTime: 30_000,
    });
}

async function createTransportClass(data: CreateTransportClassData) {
    const response = await apiFetch<ApiResponse<TransportClass>>("/transport-inventory/classes", {
        method: "POST",
        body: JSON.stringify(data),
    });
    return response;
}

export function useCreateTransportClassRQ(
    onSuccessFn: (response: ApiResponse<TransportClass>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: createTransportClass,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function updateTransportClass(classData: { id: string } & UpdateTransportClassData) {
    const { id, ...updateData } = classData;
    const response = await apiFetch<ApiResponse<TransportClass>>(`/transport-inventory/classes/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
    });
    return response;
}

export function useUpdateTransportClassRQ(
    onSuccessFn: (response: ApiResponse<TransportClass>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: updateTransportClass,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function deleteTransportClass(classId: string) {
    const response = await apiFetch<ApiResponse<{ message: string }>>(
        `/transport-inventory/classes/${classId}`,
        { method: "DELETE" }
    );
    return response;
}

export function useDeleteTransportClassRQ(
    onSuccessFn: (response: ApiResponse<{ message: string }>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: deleteTransportClass,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function getTransportRoutes(params?: GetRoutesParams) {
    const response = await apiFetch<ApiResponse<TransportRoute[]>>(
        `/transport-inventory/routes${buildQueryString(params)}`,
        { method: "GET" }
    );
    return response;
}

export function useGetTransportRoutesRQ(params?: GetRoutesParams, enabled = true) {
    return useQuery({
        queryFn: () => getTransportRoutes(params),
        queryKey: ["transport-inventory", "routes", params],
        enabled,
        staleTime: 30_000,
        gcTime: 30_000,
    });
}

async function createTransportRoute(data: CreateTransportRouteData) {
    const response = await apiFetch<ApiResponse<TransportRoute>>("/transport-inventory/routes", {
        method: "POST",
        body: JSON.stringify(data),
    });
    return response;
}

export function useCreateTransportRouteRQ(
    onSuccessFn: (response: ApiResponse<TransportRoute>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: createTransportRoute,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function updateTransportRoute(routeData: { id: string } & UpdateTransportRouteData) {
    const { id, ...updateData } = routeData;
    const response = await apiFetch<ApiResponse<TransportRoute>>(`/transport-inventory/routes/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
    });
    return response;
}

export function useUpdateTransportRouteRQ(
    onSuccessFn: (response: ApiResponse<TransportRoute>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: updateTransportRoute,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function deleteTransportRoute(routeId: string) {
    const response = await apiFetch<ApiResponse<{ message: string }>>(
        `/transport-inventory/routes/${routeId}`,
        { method: "DELETE" }
    );
    return response;
}

export function useDeleteTransportRouteRQ(
    onSuccessFn: (response: ApiResponse<{ message: string }>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: deleteTransportRoute,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function addTransportRouteStop(routeId: string, data: CreateRouteStopData) {
    const response = await apiFetch<ApiResponse<TransportRouteStop>>(
        `/transport-inventory/routes/${routeId}/stops`,
        {
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    return response;
}

export function useAddTransportRouteStopRQ(
    onSuccessFn: (response: ApiResponse<TransportRouteStop>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: ({ routeId, data }: { routeId: string; data: CreateRouteStopData }) =>
            addTransportRouteStop(routeId, data),
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function deleteTransportRouteStop(stopId: string) {
    const response = await apiFetch<ApiResponse<{ message: string }>>(
        `/transport-inventory/stops/${stopId}`,
        { method: "DELETE" }
    );
    return response;
}

export function useDeleteTransportRouteStopRQ(
    onSuccessFn: (response: ApiResponse<{ message: string }>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: deleteTransportRouteStop,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function getTransportLayouts(transportId: string) {
    const response = await apiFetch<ApiResponse<TransportLayout[]>>(
        `/transport-inventory/layouts${buildQueryString({ transportId })}`,
        { method: "GET" }
    );
    return response;
}

export function useGetTransportLayoutsRQ(transportId: string, enabled = true) {
    return useQuery({
        queryFn: () => getTransportLayouts(transportId),
        queryKey: ["transport-inventory", "layouts", transportId],
        enabled: enabled && !!transportId,
        staleTime: 30_000,
        gcTime: 30_000,
    });
}

async function createTransportLayout(data: CreateTransportLayoutData) {
    const response = await apiFetch<ApiResponse<TransportLayout>>("/transport-inventory/layouts", {
        method: "POST",
        body: JSON.stringify(data),
    });
    return response;
}

export function useCreateTransportLayoutRQ(
    onSuccessFn: (response: ApiResponse<TransportLayout>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: createTransportLayout,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function deleteTransportLayout(layoutId: string) {
    const response = await apiFetch<ApiResponse<{ message: string }>>(
        `/transport-inventory/layouts/${layoutId}`,
        { method: "DELETE" }
    );
    return response;
}

export function useDeleteTransportLayoutRQ(
    onSuccessFn: (response: ApiResponse<{ message: string }>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: deleteTransportLayout,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function getTransportTrips(params?: GetTripsParams) {
    const response = await apiFetch<ApiResponse<TransportTrip[]>>(
        `/transport-inventory/trips${buildQueryString(params)}`,
        { method: "GET" }
    );
    return response;
}

export function useGetTransportTripsRQ(params?: GetTripsParams, enabled = true) {
    return useQuery({
        queryFn: () => getTransportTrips(params),
        queryKey: ["transport-inventory", "trips", params],
        enabled,
        staleTime: 15_000,
        gcTime: 30_000,
    });
}

async function getTransportTripDetail(tripId: string) {
    const response = await apiFetch<ApiResponse<TransportTrip>>(`/transport-inventory/trips/${tripId}`, {
        method: "GET",
    });
    return response;
}

export function useGetTransportTripDetailRQ(tripId: string, enabled = true) {
    return useQuery({
        queryFn: () => getTransportTripDetail(tripId),
        queryKey: ["transport-inventory", "trips", tripId],
        enabled: enabled && !!tripId,
        staleTime: 15_000,
        gcTime: 30_000,
    });
}

async function getTransportTripSeats(tripId: string) {
    const response = await apiFetch<ApiResponse<TransportTripSeatMap>>(`/transport-inventory/trips/${tripId}/seats`, {
        method: "GET",
    });
    return response;
}

export function useGetTransportTripSeatsRQ(tripId: string, enabled = true) {
    return useQuery({
        queryFn: () => getTransportTripSeats(tripId),
        queryKey: ["transport-inventory", "trips", tripId, "seats"],
        enabled: enabled && !!tripId,
        staleTime: 0,
        gcTime: 30_000,
        refetchOnMount: "always",
    });
}

async function createTransportTrip(data: CreateTransportTripData) {
    const response = await apiFetch<ApiResponse<TransportTrip>>("/transport-inventory/trips", {
        method: "POST",
        body: JSON.stringify(data),
    });
    return response;
}

export function useCreateTransportTripRQ(
    onSuccessFn: (response: ApiResponse<TransportTrip>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: createTransportTrip,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function updateTransportTrip(tripData: { id: string } & UpdateTransportTripData) {
    const { id, ...updateData } = tripData;
    const response = await apiFetch<ApiResponse<TransportTrip>>(`/transport-inventory/trips/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
    });
    return response;
}

export function useUpdateTransportTripRQ(
    onSuccessFn: (response: ApiResponse<TransportTrip>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: updateTransportTrip,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function deleteTransportTrip(tripId: string) {
    const response = await apiFetch<ApiResponse<{ message: string }>>(
        `/transport-inventory/trips/${tripId}`,
        { method: "DELETE" }
    );
    return response;
}

export function useDeleteTransportTripRQ(
    onSuccessFn: (response: ApiResponse<{ message: string }>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: deleteTransportTrip,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function getTransportVehicles(params: GetVehiclesParams) {
    const response = await apiFetch<ApiResponse<TransportVehicle[]>>(
        `/transport-inventory/vehicles${buildQueryString(params)}`,
        { method: "GET" }
    );
    return response;
}

export function useGetTransportVehiclesRQ(params?: GetVehiclesParams, enabled = true) {
    return useQuery({
        queryFn: () => getTransportVehicles(params as GetVehiclesParams),
        queryKey: ["transport-inventory", "vehicles", params],
        enabled: enabled && !!params?.transportId,
        staleTime: 15_000,
        gcTime: 30_000,
    });
}

async function createTransportVehicle(data: CreateTransportVehicleData) {
    const response = await apiFetch<ApiResponse<TransportVehicle>>("/transport-inventory/vehicles", {
        method: "POST",
        body: JSON.stringify(data),
    });
    return response;
}

export function useCreateTransportVehicleRQ(
    onSuccessFn: (response: ApiResponse<TransportVehicle>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: createTransportVehicle,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function updateTransportVehicle(vehicleData: { id: string } & UpdateTransportVehicleData) {
    const { id, ...updateData } = vehicleData;
    const response = await apiFetch<ApiResponse<TransportVehicle>>(`/transport-inventory/vehicles/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
    });
    return response;
}

export function useUpdateTransportVehicleRQ(
    onSuccessFn: (response: ApiResponse<TransportVehicle>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: updateTransportVehicle,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

async function deleteTransportVehicle(vehicleId: string) {
    const response = await apiFetch<ApiResponse<{ message: string }>>(
        `/transport-inventory/vehicles/${vehicleId}`,
        { method: "DELETE" }
    );
    return response;
}

export function useDeleteTransportVehicleRQ(
    onSuccessFn: (response: ApiResponse<{ message: string }>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: deleteTransportVehicle,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

export type {
    CreateTransportClassData,
    UpdateTransportClassData,
    CreateRouteStopData,
    CreateTransportRouteData,
    UpdateTransportRouteData,
    LayoutSeatInput,
    CreateTransportLayoutData,
    CreateTransportTripData,
    UpdateTransportTripData,
    CreateTransportVehicleData,
    UpdateTransportVehicleData,
    GetRoutesParams,
    GetTripsParams,
    GetVehiclesParams,
};

export {
    getTransportClasses,
    createTransportClass,
    updateTransportClass,
    deleteTransportClass,
    getTransportRoutes,
    createTransportRoute,
    updateTransportRoute,
    deleteTransportRoute,
    addTransportRouteStop,
    deleteTransportRouteStop,
    getTransportLayouts,
    createTransportLayout,
    deleteTransportLayout,
    getTransportTrips,
    getTransportTripDetail,
    getTransportTripSeats,
    createTransportTrip,
    updateTransportTrip,
    deleteTransportTrip,
    getTransportVehicles,
    createTransportVehicle,
    updateTransportVehicle,
    deleteTransportVehicle,
};
