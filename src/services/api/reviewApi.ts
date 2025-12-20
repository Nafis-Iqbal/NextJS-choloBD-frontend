/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from '@tanstack/react-query';
import { ReviewType } from "@/types/enums";

interface GetReviewsParams {
    reviewType: ReviewType;
    reviewAssetId: string;
    own?: string;
}

export const getPageReviews = async ({
    reviewType,
    reviewAssetId,
    own = 'false'
}: GetReviewsParams) => {
    const params = new URLSearchParams({
        reviewType,
        reviewAssetId,
        own
    });

    const response = await apiFetch<ApiResponse<Review[]>>(
        `/reviews?${params.toString()}`,
        {
            method: "GET",
            cache: "no-store",
        }
    );

    return response;
};

export const createPageReview = async ({reviewType, reviewAssetId, reviewData}:{reviewType: ReviewType, reviewAssetId: string, reviewData: Omit<Review, 'id'>}) => {
    const response = await apiFetch<ApiResponse<Review>>(`/reviews`, {
        method: 'POST',
        body: JSON.stringify({reviewType, reviewAssetId, reviewData})
    });

    return response;
}

export function useCreatePageReviewRQ(onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) {
    return useMutation({
        mutationFn: createPageReview,
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        }
    });
}

export const updatePageReview = async (reviewId: string, reviewData: { id: string } & Partial<Omit<Review, "id">>) => {
    const response = await apiFetch<ApiResponse<Review>>(`/reviews/${reviewId}`, {
        method: 'PUT',
        body: JSON.stringify(reviewData)
    });

    return response;
}

export const useUpdateProductReviewRQ = (onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) => {
    return useMutation({
        mutationFn: ({reviewId, reviewData} : 
            {reviewId: string, reviewData: { id: string } & Partial<Omit<Review, "id">>}) => updatePageReview(reviewId, reviewData),
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        }
    });
}

export const deleteProductReview = async (reviewId: string) => {
    const response = await apiFetch<ApiResponse<void>>(`/reviews/${reviewId}`, {
        method: 'DELETE'
    });

    return response;
}

export const useDeleteProductReviewRQ = (onSuccessFn: (ApiResponse: any) => void, onErrorFn: () => void) => {
    return useMutation({
        mutationFn: deleteProductReview,
        onSuccess: (data) => {
            onSuccessFn(data);
        },
        onError: () => {
            onErrorFn();
        }
    });
}