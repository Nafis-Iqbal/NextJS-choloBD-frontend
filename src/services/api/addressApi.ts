/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from '@tanstack/react-query';

async function createAddress(addressData: Omit<Address, 'id'>) {
  const response = await apiFetch<ApiResponse<Address>>('/addresses', {
    method: 'POST',
    body: JSON.stringify(addressData),
  });

  return response;
}

export function useCreateAddressRQ(onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) {
    return useMutation({
        mutationFn: createAddress,
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        }
    });
}

export async function getAddresses(queryString?: string) {
  const response = await apiFetch<ApiResponse<Address[]>>(`/addresses${queryString ? `?${queryString}` : ""}`, {
    method: 'GET'
  });

  return response;
}

export function useGetAddressesRQ(queryString?: string) {
    return useQuery<ApiResponse<Address[]>>({
        queryFn: () => getAddresses(queryString),
        queryKey: ["addresses", queryString],
        staleTime: queryString ? 0 : 30_000, 
        gcTime: 30 * 1000,
        refetchOnMount: queryString ? "always" : false
    });
}

export async function getUserAddresses(userId: string) {
  const response = await apiFetch<ApiResponse<Address[]>>(`/addresses/users/${userId}`, {
    method: 'GET'
  });

  return response;
}

export function useGetUserAddressesRQ(userId: string, enabled: boolean) {
    return useQuery<ApiResponse<Address[]>>({
        queryFn: () => getUserAddresses(userId),
        queryKey: ["addresses", "user", userId],
        staleTime: 30_000,
        gcTime: 30 * 1000,
        enabled
    });
}

export async function updateAddress(addressData: Partial<Address> & { id: string }) {
  const { id, ...updateData } = addressData; // Extract id from the data
  
  const response = await apiFetch<ApiResponse<Address>>(`/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData), // Send only the update data, not the id
  });

  return response;
}

export function useUpdateAddressRQ(onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) {
    return useMutation({
        mutationFn: updateAddress,
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        }
    });
}

export async function deleteAddress(addressId: string) {
  const response = await apiFetch<ApiResponse<{ success: boolean }>>(`/addresses/${addressId}`, {
    method: 'DELETE'
  });

  return response;
}

export function useDeleteAddressRQ(onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) {
    return useMutation({
        mutationFn: deleteAddress,
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        }
    });
}

export async function getAddressDetail(addressId: string) {
  const response = await apiFetch<ApiResponse<Address>>(`/addresses/${addressId}`, {
    method: 'GET'
  });

  return response;
}

export function useGetAddressDetailRQ(addressId: string) {
    return useQuery<ApiResponse<Address>>({
        queryFn: () => getAddressDetail(addressId),
        queryKey: ["address", addressId],
        staleTime: 30_000,
        gcTime: 30 * 1000,
        enabled: !!addressId
    });
}

export default createAddress;