/* eslint-disable @typescript-eslint/no-explicit-any */
import { Role, UserStatus } from "@/types/enums";
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from '@tanstack/react-query';

export async function getUsers(queryString?: string) {
  const response = await apiFetch<ApiResponse<User[]>>(`/users${queryString ? `?${queryString}` : ""}`, {
    method: 'GET'
  });

  return response;
}

export function useGetUsersRQ(queryString?: string) {
    return useQuery<ApiResponse<User[]>>({
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

export async function updateUserRoleStatus(userId: string, role?: string, userStatus?: UserStatus) {
  const response = await apiFetch<ApiResponse<User>>(`/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role, userStatus }),
  });

  return response;
}

export function useUpdateUserRoleStatusRQ(onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) {
    return useMutation({
        mutationFn: ({userId, role, userStatus} : {userId: string, role?: string, userStatus?: UserStatus}) => updateUserRoleStatus(userId, role, userStatus),
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        }
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

export default getUsers;
