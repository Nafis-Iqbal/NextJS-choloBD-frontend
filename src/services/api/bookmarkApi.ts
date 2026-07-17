/* eslint-disable @typescript-eslint/no-explicit-any */
import { BookmarkType } from "@/types/enums";
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from "@tanstack/react-query";

interface CreateBookmarkData {
    bookmarkType: BookmarkType;
    bookmarkAssetId: string;
}

interface GetBookmarksParams {
    bookmarkType?: BookmarkType;
    page?: number;
    limit?: number;
}

interface CheckBookmarkParams {
    bookmarkType: BookmarkType;
    bookmarkAssetId: string;
}

interface DeleteBookmarkByAssetData {
    bookmarkType: BookmarkType;
    bookmarkAssetId: string;
}

type PaginatedBookmarks = {
    results: any[];
    total: number;
    page: number;
    limit: number;
};

type BookmarkCheckResult = {
    isBookmarked: boolean;
    bookmark: any | null;
};

function buildQueryString(params: Record<string, string | number | undefined>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    });
    return searchParams.toString();
}

/** GET /bookmarks — list current user's bookmarks */
async function getMyBookmarks(params?: GetBookmarksParams) {
    const queryString = params
        ? buildQueryString({
              bookmarkType: params.bookmarkType,
              page: params.page,
              limit: params.limit,
          })
        : "";

    const response = await apiFetch<ApiResponse<PaginatedBookmarks>>(
        `/bookmarks${queryString ? `?${queryString}` : ""}`,
        { method: "GET" }
    );
    return response;
}

export function useGetMyBookmarksRQ(params?: GetBookmarksParams, enabled = true) {
    const queryString = params
        ? buildQueryString({
              bookmarkType: params.bookmarkType,
              page: params.page,
              limit: params.limit,
          })
        : "";

    return useQuery<ApiResponse<PaginatedBookmarks>>({
        queryFn: () => getMyBookmarks(params),
        queryKey: ["bookmarks", queryString],
        staleTime: queryString ? 0 : 30_000,
        gcTime: 30_000,
        refetchOnMount: queryString ? "always" : false,
        enabled,
    });
}

/** GET /bookmarks/check — for detail-page bookmark button state */
async function checkBookmark(params: CheckBookmarkParams) {
    const queryString = buildQueryString({
        bookmarkType: params.bookmarkType,
        bookmarkAssetId: params.bookmarkAssetId,
    });

    const response = await apiFetch<ApiResponse<BookmarkCheckResult>>(
        `/bookmarks/check?${queryString}`,
        { method: "GET" }
    );
    return response;
}

export function useCheckBookmarkRQ(params: CheckBookmarkParams, enabled = true) {
    return useQuery<ApiResponse<BookmarkCheckResult>>({
        queryFn: () => checkBookmark(params),
        queryKey: ["bookmarks", "check", params.bookmarkType, params.bookmarkAssetId],
        staleTime: 0,
        gcTime: 30_000,
        refetchOnMount: "always",
        enabled:
            enabled &&
            !!params.bookmarkType &&
            !!params.bookmarkAssetId,
    });
}

/** GET /bookmarks/:bookmarkId */
async function getBookmarkById(bookmarkId: string) {
    const response = await apiFetch<ApiResponse<any>>(
        `/bookmarks/${bookmarkId}`,
        { method: "GET" }
    );
    return response;
}

export function useGetBookmarkByIdRQ(bookmarkId: string, enabled = true) {
    return useQuery<ApiResponse<any>>({
        queryFn: () => getBookmarkById(bookmarkId),
        queryKey: ["bookmarks", bookmarkId],
        staleTime: 30_000,
        gcTime: 30_000,
        enabled: enabled && !!bookmarkId,
    });
}

/** POST /bookmarks */
async function createBookmark(data: CreateBookmarkData) {
    const response = await apiFetch<ApiResponse<any>>("/bookmarks", {
        method: "POST",
        body: JSON.stringify(data),
    });
    return response;
}

export function useCreateBookmarkRQ(
    onSuccessFn: (response: ApiResponse<any>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: createBookmark,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

/** DELETE /bookmarks/:bookmarkId */
async function deleteBookmark(bookmarkId: string) {
    const response = await apiFetch<ApiResponse<{ message: string }>>(
        `/bookmarks/${bookmarkId}`,
        { method: "DELETE" }
    );
    return response;
}

export function useDeleteBookmarkRQ(
    onSuccessFn: (response: ApiResponse<{ message: string }>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: deleteBookmark,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

/** DELETE /bookmarks/by-asset — unbookmark from detail pages */
async function deleteBookmarkByAsset(data: DeleteBookmarkByAssetData) {
    const response = await apiFetch<ApiResponse<{ message: string }>>(
        "/bookmarks/by-asset",
        {
            method: "DELETE",
            body: JSON.stringify(data),
        }
    );
    return response;
}

export function useDeleteBookmarkByAssetRQ(
    onSuccessFn: (response: ApiResponse<{ message: string }>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: deleteBookmarkByAsset,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

export type {
    CreateBookmarkData,
    GetBookmarksParams,
    CheckBookmarkParams,
    DeleteBookmarkByAssetData,
    PaginatedBookmarks,
    BookmarkCheckResult,
};
