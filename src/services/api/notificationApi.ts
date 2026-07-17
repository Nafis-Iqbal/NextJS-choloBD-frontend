/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotificationAudience, Priority } from "@/types/enums";
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from "@tanstack/react-query";

interface GetNotificationsParams {
    isRead?: boolean;
    notificationAudience?: NotificationAudience;
    notificationPriority?: Priority;
    page?: number;
    limit?: number;
}

interface CreateNotificationData {
    userId: string;
    title: string;
    content: string;
    notificationAudience: NotificationAudience;
    notificationPriority?: Priority;
    relatedEntityType?: string;
    relatedEntityId?: string;
}

type PaginatedNotifications = {
    results: Notification[];
    total: number;
    page: number;
    limit: number;
};

type UnreadCountResult = {
    count: number;
};

function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    });
    return searchParams.toString();
}

/** GET /notifications — list current user's notifications */
async function getMyNotifications(params?: GetNotificationsParams) {
    const queryString = params
        ? buildQueryString({
              isRead: params.isRead,
              notificationAudience: params.notificationAudience,
              notificationPriority: params.notificationPriority,
              page: params.page,
              limit: params.limit,
          })
        : "";

    const response = await apiFetch<ApiResponse<PaginatedNotifications>>(
        `/notifications${queryString ? `?${queryString}` : ""}`,
        { method: "GET" }
    );
    return response;
}

export function useGetMyNotificationsRQ(params?: GetNotificationsParams, enabled = true) {
    const queryString = params
        ? buildQueryString({
              isRead: params.isRead,
              notificationAudience: params.notificationAudience,
              notificationPriority: params.notificationPriority,
              page: params.page,
              limit: params.limit,
          })
        : "";

    return useQuery<ApiResponse<PaginatedNotifications>>({
        queryFn: () => getMyNotifications(params),
        queryKey: ["notifications", queryString],
        staleTime: queryString ? 0 : 15_000,
        gcTime: 30_000,
        refetchOnMount: "always",
        enabled,
    });
}

/** GET /notifications/unread-count */
async function getUnreadCount() {
    const response = await apiFetch<ApiResponse<UnreadCountResult>>(
        "/notifications/unread-count",
        { method: "GET" }
    );
    return response;
}

export function useGetUnreadNotificationCountRQ(enabled = true) {
    return useQuery<ApiResponse<UnreadCountResult>>({
        queryFn: getUnreadCount,
        queryKey: ["notifications", "unread-count"],
        staleTime: 10_000,
        gcTime: 30_000,
        refetchOnMount: "always",
        enabled,
    });
}

/** GET /notifications/:notificationId */
async function getNotificationById(notificationId: string) {
    const response = await apiFetch<ApiResponse<Notification>>(
        `/notifications/${notificationId}`,
        { method: "GET" }
    );
    return response;
}

export function useGetNotificationByIdRQ(notificationId: string, enabled = true) {
    return useQuery<ApiResponse<Notification>>({
        queryFn: () => getNotificationById(notificationId),
        queryKey: ["notifications", notificationId],
        staleTime: 15_000,
        gcTime: 30_000,
        enabled: enabled && !!notificationId,
    });
}

/** PATCH /notifications/:notificationId/read */
async function markNotificationAsRead(notificationId: string) {
    const response = await apiFetch<ApiResponse<Notification>>(
        `/notifications/${notificationId}/read`,
        { method: "PATCH" }
    );
    return response;
}

export function useMarkNotificationAsReadRQ(
    onSuccessFn: (response: ApiResponse<Notification>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: markNotificationAsRead,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

/** PATCH /notifications/read-all */
async function markAllNotificationsAsRead() {
    const response = await apiFetch<ApiResponse<{ count: number }>>(
        "/notifications/read-all",
        { method: "PATCH" }
    );
    return response;
}

export function useMarkAllNotificationsAsReadRQ(
    onSuccessFn: (response: ApiResponse<{ count: number }>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: markAllNotificationsAsRead,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

/** DELETE /notifications/:notificationId */
async function deleteNotification(notificationId: string) {
    const response = await apiFetch<ApiResponse<{ message: string }>>(
        `/notifications/${notificationId}`,
        { method: "DELETE" }
    );
    return response;
}

export function useDeleteNotificationRQ(
    onSuccessFn: (response: ApiResponse<{ message: string }>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: deleteNotification,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

/** POST /notifications — MASTER_ADMIN manual create */
async function createNotification(data: CreateNotificationData) {
    const response = await apiFetch<ApiResponse<Notification>>("/notifications", {
        method: "POST",
        body: JSON.stringify(data),
    });
    return response;
}

export function useCreateNotificationRQ(
    onSuccessFn: (response: ApiResponse<Notification>) => void,
    onErrorFn: (error: any) => void
) {
    return useMutation({
        mutationFn: createNotification,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

export type {
    GetNotificationsParams,
    CreateNotificationData,
    PaginatedNotifications,
    UnreadCountResult,
};
