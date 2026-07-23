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

function statusLabel(status: ComplaintStatus): string {
    switch (status) {
        case ComplaintStatus.OPEN:
            return "Open";
        case ComplaintStatus.UNSOLVED:
            return "Unsolved";
        case ComplaintStatus.CLOSED:
            return "Closed";
        default:
            return status;
    }
}

function statusBadgeStyle(status: ComplaintStatus): React.CSSProperties {
    switch (status) {
        case ComplaintStatus.OPEN:
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
function initialsFromName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/** Entity currently handling this complaint (hotel / guide / activity spot / support). */
function handlerEntityName(complaint: Complaint): string {
    if (complaint.targetEntityName) {
        return complaint.targetEntityName;
    }

    if (complaint.addressedTo === ComplaintAddressedTo.MASTER_ADMIN) {
        return "CholoBD Support";
    }

    return "Service team";
}

/** Staff replies show the company/entity name, not the individual user. */
function commentAuthorDisplayName(
    comment: ComplaintComment,
    entityName: string
): string {
    const role = comment.author?.role;

    if (
        (role === Role.SERVICE_ADMIN || role === Role.EMPLOYEE) &&
        entityName
    ) {
        return entityName;
    }

    return (
        comment.authorName ||
        comment.author?.userName ||
        "Someone"
    );
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

function Avatar({ name, accent }: { name: string; accent?: boolean }) {
    return (
        <div
            className="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{
                backgroundColor: accent
                    ? "var(--theme-teal)"
                    : "var(--theme-card-bg)",
                color: accent ? "#ffffff" : "var(--theme-text)",
                borderWidth: "1px",
                borderColor: "var(--theme-deep-green)",
            }}
            aria-hidden
        >
            {initialsFromName(name)}
        </div>
    );
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

    const { data: commentsResponse, isLoading: isCommentsLoading } =
        ComplaintApi.useGetComplaintCommentsRQ(
            complaintId,
            isAuthenticated && !!complaintId && !!complaint && !accessDenied
        );
    const comments = commentsResponse?.data || [];

    const { mutate: addComment, isPending: isSubmittingComment } =
        ComplaintApi.useAddComplaintCommentRQ(
            () => {
                setCommentText("");
                openNotificationPopUpMessage("Your reply was sent.");
                queryClient.invalidateQueries({
                    queryKey: ["complaints", complaintId, "comments"],
                });
            },
            (error: unknown) => {
                openNotificationPopUpMessage(
                    getErrorMessage(error, "Couldn't send your reply. Try again.")
                );
            }
        );

    const { mutate: updateComplaintStatus, isPending: isMarkingSolved } =
        ComplaintApi.useUpdateComplaintStatusRQ(
            () => {
                openNotificationPopUpMessage("Complaint marked as solved.");
                queryClient.invalidateQueries({
                    queryKey: ["complaints", complaintId],
                });
                queryClient.invalidateQueries({ queryKey: ["complaints"] });
            },
            (error: unknown) => {
                openNotificationPopUpMessage(
                    getErrorMessage(
                        error,
                        "Couldn't update complaint status. Try again."
                    )
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

    const canMarkAsSolved = useMemo(() => {
        if (
            !complaint ||
            accessDenied ||
            complaint.status === ComplaintStatus.CLOSED ||
            !currentUserId ||
            !currentUserRole
        ) {
            return false;
        }

        // Complainant cannot mark solved — only the receiving authority
        if (complaint.complainantUserId === currentUserId) {
            return false;
        }

        return canAccessComplaint(complaint, {
            userId: currentUserId,
            role: currentUserRole,
            serviceEntityId: currentUser?.serviceEntityId,
            employeeServiceEntityId: currentUser?.employeeServiceEntityId,
        });
    }, [
        complaint,
        accessDenied,
        currentUserId,
        currentUserRole,
        currentUser,
    ]);

    const onSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        const content = commentText.trim();
        if (!content || !complaintId || isSubmittingComment) return;

        addComment({ complaintId, content });
    };

    const onMarkAsSolved = () => {
        if (!complaintId || isMarkingSolved || !canMarkAsSolved) return;

        updateComplaintStatus({
            complaintId,
            data: { status: ComplaintStatus.CLOSED },
        });
    };

    if (
        isAuthLoading ||
        (isAuthenticated && (isUserLoading || isComplaintLoading))
    ) {
        return (
            <section className="min-h-[60vh] flex items-center justify-center p-6 theme-text">
                <p className="theme-text-muted">Loading conversation…</p>
            </section>
        );
    }

    if (accessDenied || isComplaintError || !complaint) {
        return (
            <section className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-6 theme-text">
                <h1 className="text-2xl font-bold theme-text">
                    We couldn&apos;t open this complaint
                </h1>
                <p className="theme-text-muted text-center max-w-md">
                    It may have been removed, or you might not have access to
                    view it.
                </p>
                <Link href="/" className="theme-btn-teal px-4 py-2 rounded-md">
                    Back to home
                </Link>
            </section>
        );
    }

    const authorName =
        complaint.complainantName ||
        complaint.complainant?.userName ||
        complaint.complainant?.email ||
        "Traveler";

    const isOriginalAuthor = complaint.complainantUserId === currentUserId;
    const entityName = handlerEntityName(complaint);
    const isCurrentUserStaff =
        currentUserRole === Role.SERVICE_ADMIN ||
        currentUserRole === Role.EMPLOYEE;
    const composerDisplayName = isCurrentUserStaff
        ? entityName
        : currentUser?.userName || currentUser?.firstName || "You";

    return (
        <section
            className="w-full min-h-screen theme-text px-4 py-8 md:px-8 md:py-10 font-sans"
            id="complaint_detail_page"
        >
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <span
                            className="px-2.5 py-1 rounded-full text-xs font-semibold border"
                            style={statusBadgeStyle(complaint.status)}
                        >
                            {statusLabel(complaint.status)}
                        </span>
                        <span className="theme-text-subtle text-sm">
                            Opened {formatDateTime(complaint.createdAt)}
                        </span>
                    </div>

                    <p className="text-sm font-semibold theme-text-teal tracking-wide">
                        {entityName}
                    </p>

                    <h1 className="text-2xl md:text-3xl font-bold theme-text leading-snug">
                        {complaint.title}
                    </h1>

                    <p className="theme-text-muted text-sm">
                        Complaint submitted by{" "}
                        <span className="theme-text font-medium">
                            {authorName}
                        </span>
                    </p>
                </div>

                {/* Original post — thread starter */}
                <article className="flex gap-3 md:gap-4 pb-8">
                    <Avatar name={authorName} accent={isOriginalAuthor} />
                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span className="font-semibold theme-text">
                                {authorName}
                            </span>
                            {isOriginalAuthor && (
                                <span className="text-xs theme-text-teal">
                                    You
                                </span>
                            )}
                            <span className="text-xs theme-text-subtle">
                                · {formatDateTime(complaint.createdAt)}
                            </span>
                        </div>
                        <p className="theme-text whitespace-pre-wrap leading-relaxed text-[15px] md:text-base">
                            {complaint.description}
                        </p>
                    </div>
                </article>

                {complaint.adminResponse && (
                    <div
                        className="mb-8 ml-12 md:ml-14 pl-4 py-3"
                        style={{
                            borderLeftWidth: "3px",
                            borderLeftColor: "var(--theme-teal)",
                        }}
                    >
                        <p className="text-xs font-semibold theme-text-teal mb-1">
                            Official update
                        </p>
                        <p className="theme-text whitespace-pre-wrap text-sm leading-relaxed">
                            {complaint.adminResponse}
                        </p>
                    </div>
                )}

                {/* Replies */}
                <div
                    className="pt-2 mb-2"
                    style={{
                        borderTopWidth: "1px",
                        borderTopColor: "var(--theme-deep-green)",
                    }}
                >
                    <p className="py-4 text-sm theme-text-muted">
                        {comments.length === 0
                            ? "No replies yet"
                            : `${comments.length} ${
                                  comments.length === 1 ? "reply" : "replies"
                              }`}
                    </p>

                    <div className="flex flex-col">
                        {isCommentsLoading ? (
                            <p className="theme-text-muted text-sm py-4">
                                Loading replies…
                            </p>
                        ) : comments.length === 0 ? (
                            <p className="theme-text-subtle text-sm pb-6 leading-relaxed">
                                Be the first to continue this conversation.
                                Share any extra details that might help.
                            </p>
                        ) : (
                            comments.map((comment, index) => {
                                const isOwn =
                                    comment.authorUserId === currentUserId;
                                const name = commentAuthorDisplayName(
                                    comment,
                                    entityName
                                );

                                return (
                                    <div
                                        key={comment.id}
                                        className="flex gap-3 md:gap-4 py-5"
                                        style={
                                            index < comments.length - 1
                                                ? {
                                                      borderBottomWidth: "1px",
                                                      borderBottomColor:
                                                          "var(--theme-deep-green)",
                                                      borderBottomStyle:
                                                          "dashed",
                                                  }
                                                : undefined
                                        }
                                    >
                                        <Avatar name={name} accent={isOwn} />
                                        <div className="min-w-0 flex-1 space-y-1.5">
                                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                                <span className="font-semibold theme-text text-sm md:text-base">
                                                    {name}
                                                </span>
                                                {isOwn && (
                                                    <span className="text-xs theme-text-teal">
                                                        You
                                                    </span>
                                                )}
                                                <span className="text-xs theme-text-subtle">
                                                    ·{" "}
                                                    {formatDateTime(
                                                        comment.createdAt
                                                    )}
                                                </span>
                                            </div>
                                            <p className="theme-text whitespace-pre-wrap text-sm md:text-[15px] leading-relaxed">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Composer */}
                {canComment ? (
                    <form
                        onSubmit={onSubmitComment}
                        className="mt-6 pt-6 flex gap-3 md:gap-4"
                        style={{
                            borderTopWidth: "1px",
                            borderTopColor: "var(--theme-deep-green)",
                        }}
                    >
                        <Avatar name={composerDisplayName} accent />
                        <div className="min-w-0 flex-1 space-y-3">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                rows={3}
                                disabled={isSubmittingComment}
                                placeholder="Write a reply…"
                                className="theme-input w-full rounded-xl px-3 py-3 text-sm md:text-[15px] resize-y min-h-[88px] focus:outline-none focus:ring-2"
                                style={
                                    {
                                        backgroundColor: "var(--theme-input-bg)",
                                        color: "var(--theme-text)",
                                        borderWidth: "1px",
                                        borderColor: "var(--theme-deep-green)",
                                        "--tw-ring-color": "var(--theme-teal)",
                                    } as React.CSSProperties
                                }
                            />
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="text-xs theme-text-subtle">
                                    Keep it clear and respectful.
                                </p>
                                <button
                                    type="submit"
                                    className="theme-btn-teal px-5 py-2.5 rounded-md text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={
                                        isSubmittingComment ||
                                        !commentText.trim()
                                    }
                                >
                                    {isSubmittingComment
                                        ? "Sending…"
                                        : "Reply"}
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <p
                        className="mt-6 pt-6 theme-text-muted text-sm"
                        style={{
                            borderTopWidth: "1px",
                            borderTopColor: "var(--theme-deep-green)",
                        }}
                    >
                        This conversation is closed, so new replies can&apos;t
                        be added.
                    </p>
                )}

                {canMarkAsSolved && (
                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={onMarkAsSolved}
                            disabled={isMarkingSolved}
                            className="theme-btn-teal px-5 py-2.5 rounded-md text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isMarkingSolved
                                ? "Updating…"
                                : "Mark Complaint as Solved"}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
