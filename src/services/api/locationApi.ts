/* eslint-disable @typescript-eslint/no-explicit-any */
import { LocationType } from "@/types/enums";
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from '@tanstack/react-query';

interface LocationSearchParams {
  name?: string;
  locationType?: LocationType;
  country?: string;
  state?: string;
  city?: string;
  limit?: number;
  offset?: number;
}

interface CreateLocationData {
  name: string;
  description?: string;
  locationType: LocationType;
  country: string;
  state?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  parentLocationId?: string;
  timezone?: string;
}

interface UpdateLocationData {
  name?: string;
  description?: string;
  locationType?: LocationType;
  country?: string;
  state?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  parentLocationId?: string;
  timezone?: string;
  popularityScore?: number;
  features?: string[];
  climate?: string;
  bestVisitTime?: string;
  isPopular?: boolean;
}

export async function getAllLocations(queryString?: string) {
  const response = await apiFetch<ApiResponse<Location[]>>(`/locations${queryString ? `?${queryString}` : ""}`, {
    method: 'GET'
  });

  return response;
}

export function useGetAllLocationsRQ(queryString?: string) {
  return useQuery<ApiResponse<Location[]>>({
    queryFn: () => getAllLocations(queryString),
    queryKey: ["locations", queryString],
    staleTime: queryString ? 0 : 30_000,
    gcTime: 30 * 1000,
    refetchOnMount: queryString ? "always" : false
  });
}

export async function getPopularLocations() {
  const response = await apiFetch<ApiResponse<Location[]>>('/locations/popular', {
    method: 'GET'
  });

  return response;
}

export function useGetPopularLocationsRQ() {
  return useQuery<ApiResponse<Location[]>>({
    queryFn: () => getPopularLocations(),
    queryKey: ["locations", "popular"],
    staleTime: 5 * 60_000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export async function searchLocations(searchParams: LocationSearchParams) {
  const searchParamsObj = new URLSearchParams();
  
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParamsObj.append(key, String(value));
    }
  });

  const queryString = searchParamsObj.toString();
  const response = await apiFetch<ApiResponse<Location[]>>(`/locations/search${queryString ? `?${queryString}` : ""}`, {
    method: 'GET'
  });

  return response;
}

export function useSearchLocationsRQ(searchParams?: LocationSearchParams) {
  const queryString = searchParams ? new URLSearchParams(
    Object.entries(searchParams).filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, String(value)])
  ).toString() : undefined;

  return useQuery<ApiResponse<Location[]>>({
    queryFn: () => searchLocations(searchParams || {}),
    queryKey: ["locations", "search", queryString],
    staleTime: queryString ? 0 : 30_000,
    gcTime: 30 * 1000,
    refetchOnMount: queryString ? "always" : false,
    enabled: !!searchParams && Object.keys(searchParams).length > 0,
  });
}

export async function getLocationById(locationId: string) {
  const response = await apiFetch<ApiResponse<Location>>(`/locations/${locationId}`, {
    method: 'GET'
  });

  return response;
}

export function useGetLocationByIdRQ(locationId: string) {
  return useQuery<ApiResponse<Location>>({
    queryFn: () => getLocationById(locationId),
    queryKey: ["locations", locationId],
    enabled: !!locationId,
    staleTime: 30_000,
    gcTime: 30 * 1000,
  });
}

export async function createLocation(locationData: CreateLocationData) {
  const response = await apiFetch<ApiResponse<Location>>('/locations', {
    method: 'POST',
    body: JSON.stringify(locationData),
  });

  return response;
}

export function useCreateLocationRQ(onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) {
  return useMutation({
    mutationFn: createLocation,
    onSuccess: (data) => {
      onSuccessFn(data);
    },
    onError: () => {
      onErrorFn();
    }
  });
}

export async function updateLocation(locationId: string, locationData: UpdateLocationData) {
  const response = await apiFetch<ApiResponse<Location>>(`/locations/${locationId}`, {
    method: 'PUT',
    body: JSON.stringify(locationData),
  });

  return response;
}

export function useUpdateLocationRQ(onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) {
  return useMutation({
    mutationFn: ({ locationId, locationData }: { locationId: string; locationData: UpdateLocationData }) => 
      updateLocation(locationId, locationData),
    onSuccess: (data) => {
      onSuccessFn(data);
    },
    onError: () => {
      onErrorFn();
    }
  });
}

export async function deleteLocation(locationId: string) {
  const response = await apiFetch<ApiResponse<{ message: string }>>(`/locations/${locationId}`, {
    method: 'DELETE'
  });

  return response;
}

export function useDeleteLocationRQ(onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) {
  return useMutation({
    mutationFn: deleteLocation,
    onSuccess: (data) => {
      onSuccessFn(data);
    },
    onError: () => {
      onErrorFn();
    }
  });
}

export type {
  LocationSearchParams,
  CreateLocationData,
  UpdateLocationData,
};

export default getAllLocations;