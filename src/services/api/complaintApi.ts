/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    ComplaintAddressedTo,
    ComplaintStatus,
    ComplaintTargetType,
    ServiceType,
} from "@/types/enums";
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation } from "@tanstack/react-query";

interface CreateComplaintData {
    title: string;
    description: string;
    addressedTo: ComplaintAddressedTo;
    targetType?: ComplaintTargetType;
    targetEntityId?: string;
}

interface GetComplaintsParams {
    status?: ComplaintStatus;
    targetType?: ComplaintTargetType;
    addressedTo?: ComplaintAddressedTo;
    page?: number;
    limit?: number;
}

interface UpdateComplaintStatusData {
    status: ComplaintStatus;
    adminResponse?: string;
}

interface ComplaintEligibilityParams {
    serviceType: ServiceType;
    serviceEntityId: string;
}

interface ComplaintEligibilityResult {
    canSubmit: boolean;
    reason: string;
    qualifyingBookingCount: number;
    serviceType: ServiceType;
    serviceEntityId: string;
}

type PaginatedComplaints = {
    results: Complaint[];
    total: number;
    page: number;
    limit: number;
};

function buildQueryString(
    params: Record<string, string | number | undefined>
): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    });
    return searchParams.toString();
}

/** POST /complaints — submit a complaint */
async function createComplaint(data: CreateComplaintData) {
    const response = await apiFetch<ApiResponse<Complaint>>("/complaints", {
        method: "POST",
        body: JSON.stringify(data),
    });
    return response;
}

export function useCreateComplaintRQ(
    onSuccessFn: (response: ApiResponse<Complaint>) => void,
    onErrorFn: (error: unknown) => void
) {
    return useMutation({
        mutationFn: createComplaint,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

/** GET /complaints/eligibility — booking gate for entity complaints */
async function checkComplaintEligibility(params: ComplaintEligibilityParams) {
    const queryString = buildQueryString({
        serviceType: params.serviceType,
        serviceEntityId: params.serviceEntityId,
    });

    const response = await apiFetch<ApiResponse<ComplaintEligibilityResult>>(
        `/complaints/eligibility?${queryString}`,
        { method: "GET" }
    );
    return response;
}

export function useCheckComplaintEligibilityRQ(
    params: ComplaintEligibilityParams | null,
    enabled = true
) {
    const serviceType = params?.serviceType;
    const serviceEntityId = params?.serviceEntityId;
    const queryString =
        serviceType && serviceEntityId
            ? buildQueryString({ serviceType, serviceEntityId })
            : "";

    return useQuery<ApiResponse<ComplaintEligibilityResult>>({
        queryFn: () =>
            checkComplaintEligibility({
                serviceType: serviceType as ServiceType,
                serviceEntityId: serviceEntityId as string,
            }),
        queryKey: ["complaints", "eligibility", queryString],
        staleTime: 15_000,
        gcTime: 30_000,
        enabled: enabled && !!serviceType && !!serviceEntityId,
    });
}

/** GET /complaints/my — list current user's complaints */
async function getMyComplaints(params?: GetComplaintsParams) {
    const queryString = params
        ? buildQueryString({
              status: params.status,
              targetType: params.targetType,
              addressedTo: params.addressedTo,
              page: params.page,
              limit: params.limit,
          })
        : "";

    const response = await apiFetch<ApiResponse<PaginatedComplaints>>(
        `/complaints/my${queryString ? `?${queryString}` : ""}`,
        { method: "GET" }
    );
    return response;
}

export function useGetMyComplaintsRQ(
    params?: GetComplaintsParams,
    enabled = true
) {
    const queryString = params
        ? buildQueryString({
              status: params.status,
              targetType: params.targetType,
              addressedTo: params.addressedTo,
              page: params.page,
              limit: params.limit,
          })
        : "";

    return useQuery<ApiResponse<PaginatedComplaints>>({
        queryFn: () => getMyComplaints(params),
        queryKey: ["complaints", "my", queryString],
        staleTime: queryString ? 0 : 15_000,
        gcTime: 30_000,
        refetchOnMount: "always",
        enabled,
    });
}

/** GET /complaints/inbox — operator / MASTER_ADMIN queue */
async function getComplaintInbox(params?: GetComplaintsParams) {
    const queryString = params
        ? buildQueryString({
              status: params.status,
              targetType: params.targetType,
              addressedTo: params.addressedTo,
              page: params.page,
              limit: params.limit,
          })
        : "";

    const response = await apiFetch<ApiResponse<PaginatedComplaints>>(
        `/complaints/inbox${queryString ? `?${queryString}` : ""}`,
        { method: "GET" }
    );
    return response;
}

export function useGetComplaintInboxRQ(
    params?: GetComplaintsParams,
    enabled = true
) {
    const queryString = params
        ? buildQueryString({
              status: params.status,
              targetType: params.targetType,
              addressedTo: params.addressedTo,
              page: params.page,
              limit: params.limit,
          })
        : "";

    return useQuery<ApiResponse<PaginatedComplaints>>({
        queryFn: () => getComplaintInbox(params),
        queryKey: ["complaints", "inbox", queryString],
        staleTime: 0,
        gcTime: 30_000,
        refetchOnMount: "always",
        enabled,
    });
}

/** GET /complaints/:complaintId */
async function getComplaintById(complaintId: string) {
    const response = await apiFetch<ApiResponse<Complaint>>(
        `/complaints/${complaintId}`,
        { method: "GET" }
    );
    return response;
}

export function useGetComplaintByIdRQ(complaintId: string, enabled = true) {
    return useQuery<ApiResponse<Complaint>>({
        queryFn: () => getComplaintById(complaintId),
        queryKey: ["complaints", complaintId],
        staleTime: 15_000,
        gcTime: 30_000,
        enabled: enabled && !!complaintId,
    });
}

/** PATCH /complaints/:complaintId/status — operator status update */
async function updateComplaintStatus(payload: {
    complaintId: string;
    data: UpdateComplaintStatusData;
}) {
    const response = await apiFetch<ApiResponse<Complaint>>(
        `/complaints/${payload.complaintId}/status`,
        {
            method: "PATCH",
            body: JSON.stringify(payload.data),
        }
    );
    return response;
}

export function useUpdateComplaintStatusRQ(
    onSuccessFn: (response: ApiResponse<Complaint>) => void,
    onErrorFn: (error: unknown) => void
) {
    return useMutation({
        mutationFn: updateComplaintStatus,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

/** PATCH /complaints/:complaintId/close — complainant withdraw while OPEN */
async function closeComplaint(complaintId: string) {
    const response = await apiFetch<ApiResponse<Complaint>>(
        `/complaints/${complaintId}/close`,
        { method: "PATCH" }
    );
    return response;
}

export function useCloseComplaintRQ(
    onSuccessFn: (response: ApiResponse<Complaint>) => void,
    onErrorFn: (error: unknown) => void
) {
    return useMutation({
        mutationFn: closeComplaint,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

/** GET /complaints/:complaintId/comments */
async function getComplaintComments(complaintId: string) {
    const response = await apiFetch<ApiResponse<ComplaintComment[]>>(
        `/complaints/${complaintId}/comments`,
        { method: "GET" }
    );
    return response;
}

export function useGetComplaintCommentsRQ(complaintId: string, enabled = true) {
    return useQuery<ApiResponse<ComplaintComment[]>>({
        queryFn: () => getComplaintComments(complaintId),
        queryKey: ["complaints", complaintId, "comments"],
        staleTime: 0,
        gcTime: 30_000,
        refetchOnMount: "always",
        enabled: enabled && !!complaintId,
    });
}

/** POST /complaints/:complaintId/comments */
async function addComplaintComment(payload: {
    complaintId: string;
    content: string;
}) {
    const response = await apiFetch<ApiResponse<ComplaintComment>>(
        `/complaints/${payload.complaintId}/comments`,
        {
            method: "POST",
            body: JSON.stringify({ content: payload.content }),
        }
    );
    return response;
}

export function useAddComplaintCommentRQ(
    onSuccessFn: (response: ApiResponse<ComplaintComment>) => void,
    onErrorFn: (error: unknown) => void
) {
    return useMutation({
        mutationFn: addComplaintComment,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
    });
}

export type {
    CreateComplaintData,
    GetComplaintsParams,
    UpdateComplaintStatusData,
    ComplaintEligibilityParams,
    ComplaintEligibilityResult,
    PaginatedComplaints,
};
