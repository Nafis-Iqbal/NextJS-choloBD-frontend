/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from '@tanstack/react-query';
import { CategoryType } from "@/types/enums";

interface CreateCategoryData {
  name: string;
  type: CategoryType;
  slug: string;
  isActive?: boolean;
}

interface UpdateCategoryData {
  name?: string;
  type?: CategoryType;
  slug?: string;
  isActive?: boolean;
}

export async function getAllCategories(queryString?: string) {
  const response = await apiFetch<ApiResponse<Category[]>>(`/categories${queryString ? `?${queryString}` : ""}`, {
    method: 'GET'
  });

  return response;
}

export function useGetAllCategoriesRQ(queryString?: string) {
  return useQuery<ApiResponse<Category[]>>({
    queryFn: () => getAllCategories(queryString),
    queryKey: ["categories", queryString],
    staleTime: queryString ? 0 : 30_000,
    gcTime: 30 * 1000,
    refetchOnMount: queryString ? "always" : false,
  });
}

export async function getCategoryById(categoryId: string) {
  const response = await apiFetch<ApiResponse<Category>>(`/categories/${categoryId}`, {
    method: 'GET'
  });

  return response;
}

export function useGetCategoryByIdRQ(categoryId: string) {
  return useQuery<ApiResponse<Category>>({
    queryFn: () => getCategoryById(categoryId),
    queryKey: ["categories", categoryId],
    enabled: !!categoryId,
    staleTime: 30_000,
    gcTime: 30 * 1000,
  });
}

export async function createCategory(categoryData: CreateCategoryData) {
  const response = await apiFetch<ApiResponse<Category>>('/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });

  return response;
}

export function useCreateCategoryRQ(onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) {
  return useMutation({
    mutationFn: createCategory,
    onSuccess: (data) => {
      onSuccessFn(data);
    },
    onError: () => {
      onErrorFn();
    }
  });
}

export async function updateCategory(categoryId: string, categoryData: UpdateCategoryData) {
  const response = await apiFetch<ApiResponse<Category>>(`/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  });

  return response;
}

export function useUpdateCategoryRQ(onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) {
  return useMutation({
    mutationFn: ({ categoryId, categoryData }: { categoryId: string; categoryData: UpdateCategoryData }) => 
      updateCategory(categoryId, categoryData),
    onSuccess: (data) => {
      onSuccessFn(data);
    },
    onError: () => {
      onErrorFn();
    }
  });
}

export async function deleteCategory(categoryId: string) {
  const response = await apiFetch<ApiResponse<{ message: string }>>(`/categories/${categoryId}`, {
    method: 'DELETE'
  });

  return response;
}

export function useDeleteCategoryRQ(onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) {
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (data) => {
      onSuccessFn(data);
    },
    onError: () => {
      onErrorFn();
    }
  });
}

export type {
  CreateCategoryData,
  UpdateCategoryData,
};

export default getAllCategories;
