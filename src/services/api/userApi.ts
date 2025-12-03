/* eslint-disable @typescript-eslint/no-explicit-any */
import { Role, UserStatus } from "@/types/enums";
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from '@tanstack/react-query';

async function getCurrentUserAuthentication() {
  const response = await apiFetch<ApiResponse<{ 
    isAuthenticated: boolean 
    userId: string,
    userRole: Role
  }>>(`/auth/authenticate`, {
    method: 'GET'
  });

  return response;
}

export function useGetUserAuthenticationRQ(userId: string, enabled: boolean) {
    return useQuery<ApiResponse<{ 
      isAuthenticated: boolean 
      userId: string,
      userRole: Role 
    }>>({
        queryFn: () => getCurrentUserAuthentication(),
        queryKey: ["users", userId, "authenticate"],
        staleTime: 30_000,
        gcTime: 30 * 1000,
        enabled
    });
}

async function createUser(userData: UserData) {
  const response = await apiFetch<ApiResponse<User>>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  return response;
}

export function useCreateUserRQ(onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) {
    return useMutation({
        mutationFn: createUser,
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        }
    });
}

async function loginUser(loginData: LoginData) {
  const response = await apiFetch<ApiResponse<User>>('/auth/login-session', {
    method: 'POST',
    body: JSON.stringify(loginData),
  });

  return response;
}

export function useLoginUserRQ(onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) {
    return useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        }
    });
}

// OAuth Login Functions
async function googleOAuthLogin() {
  const response = await apiFetch<ApiResponse<{ 
    user: User,
    accessToken: string,
    refreshToken?: string 
  }>>('/auth/google', {
    method: 'GET'
  });

  return response;
}

export function useGoogleOAuthLoginRQ(onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) {
    return useMutation({
        mutationFn: googleOAuthLogin,
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        }
    });
}

async function facebookOAuthLogin() {
  const response = await apiFetch<ApiResponse<{ 
    user: User,
    accessToken: string,
    refreshToken?: string 
  }>>('/auth/facebook', {
    method: 'GET'
  });

  return response;
}

export function useFacebookOAuthLoginRQ(onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) {
    return useMutation({
        mutationFn: facebookOAuthLogin,
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        }
    });
}

async function logoutUser() {
  const response = await apiFetch<ApiResponse<null>>('/auth/logout-session', {
    method: 'POST',
  });
  
  return response;
}

export function useLogoutUserRQ(onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) {
    return useMutation({
        mutationFn: logoutUser,
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        }
    });
}

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
  const response = await apiFetch<ApiResponse<User>>(`/users/${userData.id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
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
  const response = await apiFetch<ApiResponse<User>>(`/admin/users/${userId}`, {
    method: 'PATCH',
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
  const response = await apiFetch<ApiResponse<User>>(`/users/${userId}`, {
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

export default createUser;
