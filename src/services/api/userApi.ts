/* eslint-disable @typescript-eslint/no-explicit-any */
import { Role, ServiceType, UserStatus } from "@/types/enums";
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from '@tanstack/react-query';

export type PaginatedUsers = {
  results: User[];
  total: number;
  page: number;
  limit: number;
};

export type PublicUserProfile = {
  id: string;
  userName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  role: Role;
  serviceType?: ServiceType | null;
  serviceEntityName?: string | null;
  employeeServiceType?: ServiceType | null;
  employeeServiceEntityName?: string | null;
  createdAt: string;
  userStatus?: UserStatus | string;
  _count: {
    userTripPlans: number;
    tripBookings: number;
    communityPostsCreated: number;
    reviews: number;
  };
};

export async function getUsers(queryString?: string) {
  const response = await apiFetch<ApiResponse<PaginatedUsers>>(`/users${queryString ? `?${queryString}` : ""}`, {
    method: 'GET'
  });

  return response;
}

export function useGetUsersRQ(queryString?: string) {
    return useQuery<ApiResponse<PaginatedUsers>>({
        queryFn: () => getUsers(queryString),
        queryKey: ["users", queryString],
        staleTime: queryString ? 0 : 30_000, 
        gcTime: 30 * 1000,
        refetchOnMount: queryString ? "always" : false
    });
}

export async function updateUser(userData: {id: string} & Partial<Omit<User, "id">>) {
  const { id, ...updateData } = userData;
  const response = await apiFetch<ApiResponse<User>>(`/users/profile`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });

  return response;
}

export function useUpdateUserRQ(onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) {
    return useMutation({
        mutationFn: updateUser,
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        }
    });
}

export async function updateUserRoleStatusService(
  userId: string, 
  role?: string, 
  userStatus?: UserStatus, 
  userServiceType?: ServiceType,
  serviceEntityId?: string,
  employeeServiceType?: ServiceType,
  employeeServiceEntityId?: string
) {
  const response = await apiFetch<ApiResponse<User>>(`/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role, userStatus, userServiceType, serviceEntityId, employeeServiceType, employeeServiceEntityId }),
  });

  return response;
}

export function useUpdateUserRoleStatusServiceRQ(onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) {
    return useMutation({
        mutationFn: ({
          userId, 
          role, 
          userStatus, 
          userServiceType, 
          serviceEntityId, 
          employeeServiceType, 
          employeeServiceEntityId
        }:{
          userId: string, 
          role?: string, 
          userStatus?: UserStatus, 
          userServiceType?: ServiceType, 
          serviceEntityId?: string,
          employeeServiceType?: ServiceType,
          employeeServiceEntityId?: string
        }) => 
          updateUserRoleStatusService(
            userId, 
            role, 
            userStatus, 
            userServiceType, 
            serviceEntityId, 
            employeeServiceType, 
            employeeServiceEntityId
          ),
          onSuccess: (data) => {
              onSuccessFn(data);
          },
          onError: () => {
              onErrorFn();
          }
    });
}

export async function getOwnUserDetail(_userId?: string) {
  const response = await apiFetch<ApiResponse<User>>(`/users/profile`, {
    method: 'GET'
  });

  return response;
}

export function useGetOwnUserDetailRQ(userId: string, enabled: boolean) {
    return useQuery<ApiResponse<User>>({
        queryFn: () => getOwnUserDetail(userId),
        // Stable key: endpoint always returns the authenticated user (userId is only a gate).
        // Using ["users", userId] raced with "" → real id and left consumers on stale/empty data.
        queryKey: ["users", "profile"],
        staleTime: 30_000,
        gcTime: 30 * 1000,
        enabled: enabled && !!userId,
    });
}

export async function getUserDetail(userId: string) {
  const response = await apiFetch<ApiResponse<User>>(`/users/profile/${userId}`, {
    method: 'GET'
  });

  return response;
}

export function useGetUserDetailRQ(userId: string, enabled: boolean) {
    return useQuery<ApiResponse<User>>({
        queryFn: () => getUserDetail(userId),
        queryKey: ["users", userId],
        staleTime: 30_000,
        gcTime: 30 * 1000,
        enabled
    });
}

export async function getPublicUserDetail(userId: string) {
  const response = await apiFetch<ApiResponse<PublicUserProfile>>(`/users/profile/${userId}/public`, {
    method: 'GET'
  });

  return response;
}

export function useGetPublicUserDetailRQ(userId: string, enabled: boolean) {
    return useQuery<ApiResponse<PublicUserProfile>>({
        queryFn: () => getPublicUserDetail(userId),
        queryKey: ["users", "public", userId],
        staleTime: 30_000,
        gcTime: 30 * 1000,
        enabled
    });
}

export default getUsers;
