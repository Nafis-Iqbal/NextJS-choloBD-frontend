"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AuthApi, ComplaintApi, UserApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import {
    ComplaintAddressedTo,
    ComplaintStatus,
    Role,
} from "@/types/enums";
import { CustomTextAreaInput } from "@/components/custom-elements/CustomInputElements";

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
    ) {
        return (error as { message: string }).message;
    }

    return fallback;
}

function getErrorStatus(error: unknown): number | undefined {
    if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof (error as { status: unknown }).status === "number"
    ) {
        return (error as { status: number }).status;
    }

    return undefined;
}

function formatEnumValue(value: string): string {
    return value
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase())
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function formatDateTime(value: Date | string): string {
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function statusBadgeStyle(status: ComplaintStatus): React.CSSProperties {
    switch (status) {
        case ComplaintStatus.PENDING:
            return {
                backgroundColor: "var(--theme-card-bg)",
                color: "var(--theme-text-muted)",
                borderColor: "var(--theme-deep-green)",
            };
        case ComplaintStatus.UNDER_REVIEW:
            return {
                backgroundColor: "var(--theme-teal)",
                color: "#ffffff",
                borderColor: "var(--theme-teal)",
            };
        case ComplaintStatus.UNSOLVED:
            return {
                backgroundColor: "var(--theme-red, #DC2626)",
                color: "#ffffff",
                borderColor: "var(--theme-red, #DC2626)",
            };
        case ComplaintStatus.CLOSED:
            return {
                backgroundColor: "var(--theme-deep-green)",
                color: "#ffffff",
                borderColor: "var(--theme-deep-green)",
            };
        default:
            return {
                backgroundColor: "var(--theme-card-bg)",
                color: "var(--theme-text)",
                borderColor: "var(--theme-deep-green)",
            };
    }
}

function canAccessComplaint(
    complaint: Complaint,
    viewer: {
        userId: string;
        role: Role;
        serviceEntityId?: string | null;
        employeeServiceEntityId?: string | null;
    }
): boolean {
    if (complaint.complainantUserId === viewer.userId) {
        return true;
    }

    if (viewer.role === Role.MASTER_ADMIN) {
        return true;
    }

    if (
        complaint.addressedTo !== ComplaintAddressedTo.SERVICE_ADMIN ||
        !complaint.targetEntityId
    ) {
        return false;
    }

    if (
        viewer.role === Role.SERVICE_ADMIN &&
        viewer.serviceEntityId === complaint.targetEntityId
    ) {
        return true;
    }

    if (
        viewer.role === Role.EMPLOYEE &&
        viewer.employeeServiceEntityId === complaint.targetEntityId
    ) {
        return true;
    }

    return false;
}

export default function ComplaintDetailPage() {
    const router = useRouter();
    const params = useParams();
    const complaintId = String(params?.complaint_id || "");

    const { openNotificationPopUpMessage } = useGlobalUI();
    const [commentText, setCommentText] = useState("");
    const [accessDenied, setAccessDenied] = useState(false);

    const { data: authResponse, isLoading: isAuthLoading } =
        AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserId = authResponse?.data?.userId;
    const currentUserRole = authResponse?.data?.userRole;

    const { data: userDetailResponse, isLoading: isUserLoading } =
        UserApi.useGetOwnUserDetailRQ(
            currentUserId || "",
            isAuthenticated && !!currentUserId
        );
    const currentUser = userDetailResponse?.data;

    const {
        data: complaintResponse,
        isLoading: isComplaintLoading,
        isError: isComplaintError,
        error: complaintError,
    } = ComplaintApi.useGetComplaintByIdRQ(
        complaintId,
        isAuthenticated && !!complaintId
    );
    const complaint = complaintResponse?.data;

    const {
        data: commentsResponse,
        isLoading: isCommentsLoading,
    } = ComplaintApi.useGetComplaintCommentsRQ(
        complaintId,
        isAuthenticated && !!complaintId && !!complaint && !accessDenied
    );
    const comments = commentsResponse?.data || [];

    const { mutate: addComment, isPending: isSubmittingComment } =
        ComplaintApi.useAddComplaintCommentRQ(
            () => {
                setCommentText("");
                openNotificationPopUpMessage("Comment posted.");
                queryClient.invalidateQueries({
                    queryKey: ["complaints", complaintId, "comments"],
                });
            },
            (error: unknown) => {
                openNotificationPopUpMessage(
                    getErrorMessage(error, "Failed to post comment.")
                );
            }
        );

    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            router.replace("/");
        }
    }, [isAuthLoading, isAuthenticated, router]);

    useEffect(() => {
        const status = getErrorStatus(complaintError);
        if (isComplaintError && (status === 403 || status === 404)) {
            setAccessDenied(true);
        }
    }, [isComplaintError, complaintError]);

    useEffect(() => {
        if (
            !isAuthLoading &&
            !isUserLoading &&
            !isComplaintLoading &&
            isAuthenticated &&
            currentUserId &&
            currentUserRole &&
            complaint
        ) {
            const allowed = canAccessComplaint(complaint, {
                userId: currentUserId,
                role: currentUserRole,
                serviceEntityId: currentUser?.serviceEntityId,
                employeeServiceEntityId: currentUser?.employeeServiceEntityId,
            });

            if (!allowed) {
                setAccessDenied(true);
            }
        }
    }, [
        isAuthLoading,
        isUserLoading,
        isComplaintLoading,
        isAuthenticated,
        currentUserId,
        currentUserRole,
        currentUser,
        complaint,
    ]);

    const canComment = useMemo(() => {
        return (
            !!complaint &&
            complaint.status !== ComplaintStatus.CLOSED &&
            !accessDenied
        );
    }, [complaint, accessDenied]);

    const onSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        const content = commentText.trim();
        if (!content || !complaintId || isSubmittingComment) return;

        addComment({ complaintId, content });
    };

    if (isAuthLoading || (isAuthenticated && (isUserLoading || isComplaintLoading))) {
        return (
            <section className="min-h-[60vh] flex items-center justify-center p-6 theme-text">
                <p className="theme-text-muted">Loading complaint…</p>
            </section>
        );
    }

    if (accessDenied || isComplaintError || !complaint) {
        return (
            <section className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-6 theme-text">
                <h1 className="text-2xl font-bold theme-text-teal">
                    Complaint not found
                </h1>
                <p className="theme-text-muted text-center max-w-md">
                    This complaint does not exist, or you do not have permission
                    to view it.
                </p>
                <Link href="/" className="green-button px-4 py-2">
                    Go to homepage
                </Link>
            </section>
        );
    }

    return (
        <section
            className="w-full min-h-screen theme-text p-4 md:p-8"
            id="complaint_detail_page"
        >
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="theme-text-subtle text-sm mb-1">
                            Complaint detail
                        </p>
                        <h1 className="text-3xl font-bold theme-text-teal">
                            {complaint.title}
                        </h1>
                    </div>

                    <span
                        className="px-3 py-1 rounded-md text-sm font-semibold border"
                        style={statusBadgeStyle(complaint.status)}
                    >
                        {formatEnumValue(complaint.status)}
                    </span>
                </div>

                <div className="theme-section theme-outline rounded-xl p-4 md:p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="theme-text-subtle">Submitted</p>
                            <p className="theme-text font-medium">
                                {formatDateTime(complaint.createdAt)}
                            </p>
                        </div>
                        <div>
                            <p className="theme-text-subtle">Filed by</p>
                            <p className="theme-text font-medium">
                                {complaint.complainantName ||
                                    complaint.complainant?.userName ||
                                    complaint.complainant?.email ||
                                    "Unknown user"}
                            </p>
                        </div>
                        {complaint.targetEntityName && (
                            <div>
                                <p className="theme-text-subtle">
                                    Related entity
                                </p>
                                <p className="theme-text font-medium">
                                    {complaint.targetEntityName}
                                    {complaint.targetType
                                        ? ` (${formatEnumValue(complaint.targetType)})`
                                        : ""}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="theme-text-subtle">Addressed to</p>
                            <p className="theme-text font-medium">
                                {formatEnumValue(complaint.addressedTo)}
                            </p>
                        </div>
                    </div>

                    <div
                        className="pt-4 border-t"
                        style={{ borderColor: "var(--theme-deep-green)" }}
                    >
                        <p className="theme-text-subtle text-sm mb-2">
                            Description
                        </p>
                        <p className="theme-text whitespace-pre-wrap leading-relaxed">
                            {complaint.description}
                        </p>
                    </div>

                    {complaint.adminResponse && (
                        <div
                            className="pt-4 border-t"
                            style={{ borderColor: "var(--theme-deep-green)" }}
                        >
                            <p className="theme-text-subtle text-sm mb-2">
                                Admin response
                            </p>
                            <p className="theme-text whitespace-pre-wrap">
                                {complaint.adminResponse}
                            </p>
                        </div>
                    )}
                </div>

                <div className="theme-section theme-outline rounded-xl p-4 md:p-6 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-xl font-semibold theme-text-teal">
                            Discussion
                        </h2>
                        <span className="theme-text-subtle text-sm">
                            {comments.length} comment
                            {comments.length === 1 ? "" : "s"}
                        </span>
                    </div>

                    <div className="flex flex-col gap-3 min-h-[180px]">
                        {isCommentsLoading ? (
                            <p className="theme-text-muted text-sm">
                                Loading comments…
                            </p>
                        ) : comments.length === 0 ? (
                            <p className="theme-text-muted text-sm">
                                No comments yet. Start the conversation below.
                            </p>
                        ) : (
                            comments.map((comment) => {
                                const isOwn =
                                    comment.authorUserId === currentUserId;
                                return (
                                    <div
                                        key={comment.id}
                                        className={`theme-card theme-outline rounded-lg p-3 ${
                                            isOwn ? "ml-4 md:ml-12" : "mr-4 md:mr-12"
                                        }`}
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                            <p className="font-semibold theme-text">
                                                {comment.authorName ||
                                                    comment.author?.userName ||
                                                    "User"}
                                                {isOwn ? " (You)" : ""}
                                            </p>
                                            <p className="theme-text-subtle text-xs">
                                                {formatDateTime(comment.createdAt)}
                                            </p>
                                        </div>
                                        <p className="theme-text whitespace-pre-wrap text-sm leading-relaxed">
                                            {comment.content}
                                        </p>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {canComment ? (
                        <form
                            onSubmit={onSubmitComment}
                            className="pt-4 border-t space-y-3"
                            style={{ borderColor: "var(--theme-deep-green)" }}
                        >
                            <CustomTextAreaInput
                                label="Add a comment"
                                placeholderText="Write your reply…"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                rows={4}
                                className="theme-input w-full"
                                disabled={isSubmittingComment}
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="green-button px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={
                                        isSubmittingComment ||
                                        !commentText.trim()
                                    }
                                >
                                    {isSubmittingComment
                                        ? "Posting…"
                                        : "Post comment"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p
                            className="pt-4 border-t theme-text-muted text-sm"
                            style={{ borderColor: "var(--theme-deep-green)" }}
                        >
                            This complaint is closed. Commenting is disabled.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
