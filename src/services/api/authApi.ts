/* eslint-disable @typescript-eslint/no-explicit-any */
import { Role, UserStatus, ServiceType } from "@/types/enums";
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from '@tanstack/react-query';

export interface AuthCheckData {
  isAuthenticated: boolean;
  userId: string;
  userName: string;
  userRole: Role;
  userServiceType?: ServiceType;
}

export type AuthCheckResponse = ApiResponse<AuthCheckData>;

export const AUTH_QUERY_KEY = ["users", "authenticate"] as const;

async function getCurrentUserAuthentication(): Promise<AuthCheckResponse> {
  try {
    return await apiFetch<AuthCheckResponse>(`/auth/authenticate`, {
      method: 'GET'
    });
  } catch (error: any) {
    // Backend returns 401 when logged out. Treat that as a successful
    // "not authenticated" result so React Query replaces any stale
    // authenticated cache instead of keeping isAuthenticated: true + isError.
    if (error?.status === 401) {
      const unauthenticated: AuthCheckResponse = {
        status: "failure",
        message: error?.message || "User is not authenticated",
        data: {
          isAuthenticated: false,
          userId: "",
          userName: "",
          userRole: Role.USER,
        },
      };
      return unauthenticated;
    }
    throw error;
  }
}

export function useGetUserAuthenticationRQ(enabled: boolean) {
    return useQuery<AuthCheckResponse, Error>({
        queryFn: getCurrentUserAuthentication,
        queryKey: AUTH_QUERY_KEY,
        staleTime: 0,
        gcTime: 30 * 1000,
        retry: false,
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

export default getCurrentUserAuthentication;