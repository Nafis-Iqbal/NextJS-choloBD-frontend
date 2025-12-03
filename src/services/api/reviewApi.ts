/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from '@tanstack/react-query';

export const getProductReviews = async (productId: string, queryString?: string) => {
    const response = await apiFetch<ApiResponse<Review[]>>(`/products/${productId}/reviews?${queryString}`, {
        method: 'GET',
        cache: 'no-store'
    });

    return response;
}

export function useGetProductReviewsRQ(productId: string, queryString?: string) {
    return useQuery<ApiResponse<Review[]>>({
        queryFn: () => getProductReviews(productId, queryString),
        queryKey: ["reviews", productId],
        staleTime: queryString ? 0 : 30_000, 
        gcTime: 30 * 1000
    });
}

export const createProductReview = async (productId: string, reviewData: Omit<Review, 'id'>) => {
    const response = await apiFetch<ApiResponse<Review>>(`/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(reviewData)
    });

    return response;
}

export function useCreateProductReviewRQ(onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) {
    return useMutation({
        mutationFn: ({productId, reviewData} : {productId: string, reviewData: Omit<Review, 'id'>}) => createProductReview(productId, reviewData),
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        }
    });
}

export const updateProductReview = async (productId: string, reviewId: string, reviewData: { id: string } & Partial<Omit<Review, "id">>) => {
    const response = await apiFetch<ApiResponse<Review>>(`/products/${productId}/reviews/${reviewId}`, {
        method: 'PUT',
        body: JSON.stringify(reviewData)
    });

    return response;
}

export const useUpdateProductReviewRQ = (onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) => {
    return useMutation({
        mutationFn: ({productId, reviewId, reviewData} : 
            {productId: string, reviewId: string, reviewData: { id: string } & Partial<Omit<Review, "id">>}) => updateProductReview(productId, reviewId, reviewData),
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        }
    });
}

export const deleteProductReview = async (productId: string, reviewId: string) => {
    const response = await apiFetch<ApiResponse<void>>(`/products/${productId}/reviews/${reviewId}`, {
        method: 'DELETE'
    });

    return response;
}

export const useDeleteProductReviewRQ = (onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) => {
    return useMutation({
        mutationFn: ({productId, reviewId} : {productId: string, reviewId: string}) => deleteProductReview(productId, reviewId),
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        }
    });
}