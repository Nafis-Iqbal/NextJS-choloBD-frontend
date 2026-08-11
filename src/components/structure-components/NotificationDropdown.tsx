"use client";

import { useEffect, useRef, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { FaBell, FaSpinner, FaTimes } from "react-icons/fa";
import { AuthApi, NotificationApi } from "@/services/api";
import { NotificationAudience, Priority, Role } from "@/types/enums";
import IconWithBadge from "../custom-elements/IconWithBadge";

const PAGE_SIZE = 10;

/** ~5 notification rows visible in the md list viewport */
const MD_LIST_HEIGHT = "md:h-[17.5rem]";

const AUDIENCE_LABELS: Record<NotificationAudience, string> = {
    [NotificationAudience.USER]: "Personal",
    [NotificationAudience.SERVICE_ADMIN]: "Service Admin",
    [NotificationAudience.EMPLOYEE]: "Employee",
    [NotificationAudience.MASTER_ADMIN]: "Platform Admin",
};

const AUDIENCE_ORDER: NotificationAudience[] = [
    NotificationAudience.USER,
    NotificationAudience.SERVICE_ADMIN,
    NotificationAudience.EMPLOYEE,
    NotificationAudience.MASTER_ADMIN,
];

const ROLE_AUDIENCE: Partial<Record<Role, NotificationAudience>> = {
    [Role.USER]: NotificationAudience.USER,
    [Role.SERVICE_ADMIN]: NotificationAudience.SERVICE_ADMIN,
    [Role.EMPLOYEE]: NotificationAudience.EMPLOYEE,
    [Role.MASTER_ADMIN]: NotificationAudience.MASTER_ADMIN,
};

const NAME_ACTION_PATTERN =
    /^(.+?)(\s+(?:commented|replied|tagged|accepted|declined|submitted|booked|cancelled|canceled|updated|requested)\b.*)$/i;

type NotificationDropdownProps = {
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
};

/**
 * Formats a username for display:
 * - collapses consecutive `_` into one separator
 * - keeps at most 2 words (stops at the second `_` boundary)
 * - replaces `_` with spaces
 * - capitalizes the first letter of each word
 *
 * Examples: abc____cdf_ff → "Abc Cdf" · a_b_c → "A B"
 */
function formatDisplayUsername(username: string): string {
    if (!username) return "";

    const words = username
        .trim()
        .replace(/_+/g, "_")
        .split("_")
        .filter(Boolean)
        .slice(0, 2);

    if (!words.length) return "";

    return words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function formatRelativeTime(dateValue: Date | string): string {
    const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

function renderPlainWithNames(text: string, keyPrefix: string): ReactNode[] {
    const match = text.match(NAME_ACTION_PATTERN);
    if (!match) {
        return [
            <span key={`${keyPrefix}-plain`} className="theme-text">
                {text}
            </span>,
        ];
    }

    return [
        <span key={`${keyPrefix}-name`} className="text-green-600 font-semibold">
            {formatDisplayUsername(match[1])}
        </span>,
        <span key={`${keyPrefix}-rest`} className="theme-text">
            {match[2]}
        </span>,
    ];
}

/** Highlight user names (green) and quoted page/asset/domain names (sky blue). */
function renderColoredContent(content: string): ReactNode {
    const segments = content.split(/("(?:[^"\\]|\\.)*")/g).filter((s) => s.length > 0);

    return segments.map((segment, index) => {
        const key = `seg-${index}`;
        if (segment.startsWith('"') && segment.endsWith('"') && segment.length >= 2) {
            return (
                <span key={key} className="text-sky-500 font-semibold">
                    {segment}
                </span>
            );
        }
        return <span key={key}>{renderPlainWithNames(segment, key)}</span>;
    });
}

function FilterChip({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-sm border transition ${
                active
                    ? "theme-btn-teal text-white border-transparent"
                    : "bg-transparent theme-text border-[var(--theme-border-subtle)] hover:brightness-110"
            }`}
        >
            {label}
        </button>
    );
}

function getEmptyStateCopy(
    audienceFilter: NotificationAudience | null,
    priorityFilter: Priority | null
): { title: string; subtitle: string } {
    const audienceLabel = audienceFilter
        ? AUDIENCE_LABELS[audienceFilter].toLowerCase()
        : null;

    const priorityLabel =
        priorityFilter === Priority.URGENT
            ? "urgent"
            : priorityFilter === Priority.NORMAL
              ? "normal-priority"
              : null;

    if (audienceFilter === NotificationAudience.USER) {
        return {
            title: priorityLabel
                ? `No ${priorityLabel} personal notifications`
                : "No personal notifications",
            subtitle: priorityLabel
                ? `You have no ${priorityLabel} items in your personal inbox.`
                : "Personal updates about your bookings, payments, and account activity will show up here.",
        };
    }

    if (audienceFilter && audienceLabel) {
        return {
            title: priorityLabel
                ? `No ${priorityLabel} ${audienceLabel} notifications`
                : `No ${audienceLabel} notifications`,
            subtitle: priorityLabel
                ? `Nothing ${priorityLabel} in your ${audienceLabel} inbox right now.`
                : `Updates for your ${audienceLabel} queue will appear here.`,
        };
    }

    return {
        title: "No notifications yet",
        subtitle: "Updates will show up here when something needs your attention.",
    };
}

export default function NotificationDropdown({
    isOpen,
    onToggle,
    onClose,
}: NotificationDropdownProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [items, setItems] = useState<Notification[]>([]);
    const [priorityFilter, setPriorityFilter] = useState<Priority | null>(null);
    const [audienceFilter, setAudienceFilter] = useState<NotificationAudience | null>(null);
    const [audienceInitialized, setAudienceInitialized] = useState(false);

    const invalidateUnreadCount = () => {
        queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    };

    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const userRole = authResponse?.data?.userRole;
    const showAudienceFilters =
        userRole === Role.SERVICE_ADMIN ||
        userRole === Role.EMPLOYEE ||
        userRole === Role.MASTER_ADMIN;
    const roleAudience = userRole ? ROLE_AUDIENCE[userRole] : undefined;

    useEffect(() => {
        if (!userRole || audienceInitialized) return;

        const defaultAudience =
            userRole === Role.USER
                ? NotificationAudience.USER
                : ROLE_AUDIENCE[userRole] ?? NotificationAudience.USER;

        setAudienceFilter(defaultAudience);
        setAudienceInitialized(true);
        setPage(1);
        setItems([]);
    }, [userRole, audienceInitialized]);

    const { data: unreadResponse } = NotificationApi.useGetUnreadNotificationCountRQ(
        isAuthenticated
    );
    const unreadCount = unreadResponse?.data?.count ?? 0;

    const listParams = {
        page,
        limit: PAGE_SIZE,
        ...(priorityFilter ? { notificationPriority: priorityFilter } : {}),
        ...(audienceFilter ? { notificationAudience: audienceFilter } : {}),
    };

    const { data: listResponse, isLoading, isFetching } =
        NotificationApi.useGetMyNotificationsRQ(
            listParams,
            isAuthenticated && isOpen && audienceFilter !== null
        );

    const total = listResponse?.data?.total ?? 0;
    const hasMore = items.length < total;
    const emptyCopy = getEmptyStateCopy(audienceFilter, priorityFilter);

    useEffect(() => {
        const results = listResponse?.data?.results;
        if (!results) return;

        setItems((prev) => {
            if (page === 1) return results;
            const existingIds = new Set(prev.map((n) => n.id));
            const appended = results.filter((n) => !existingIds.has(n.id));
            return [...prev, ...appended];
        });
    }, [listResponse, page]);

    const resetList = () => {
        setPage(1);
        setItems([]);
    };

    const togglePriority = (value: Priority) => {
        setPriorityFilter((prev) => (prev === value ? null : value));
        resetList();
    };

    const selectAudience = (value: NotificationAudience) => {
        if (audienceFilter === value) return;
        setAudienceFilter(value);
        resetList();
    };

    const markReadMutation = NotificationApi.useMarkNotificationAsReadRQ(
        (response) => {
            invalidateUnreadCount();
            const updated = response.data;
            if (!updated) return;
            setItems((prev) =>
                prev.map((n) =>
                    n.id === updated.id
                        ? { ...n, isRead: true, readAt: updated.readAt ?? n.readAt }
                        : n
                )
            );
        },
        () => {}
    );

    const markAllMutation = NotificationApi.useMarkAllNotificationsAsReadRQ(
        () => {
            invalidateUnreadCount();
            setItems((prev) =>
                prev.map((n) => ({
                    ...n,
                    isRead: true,
                    readAt: n.readAt ?? new Date().toISOString(),
                }))
            );
        },
        () => {}
    );

    const grouped = useMemo(() => {
        const map = new Map<NotificationAudience, Notification[]>();
        for (const audience of AUDIENCE_ORDER) {
            map.set(audience, []);
        }
        for (const n of items) {
            const key = n.notificationAudience as NotificationAudience;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(n);
        }
        return AUDIENCE_ORDER.map((audience) => ({
            audience,
            label: AUDIENCE_LABELS[audience],
            items: map.get(audience) ?? [],
        })).filter((section) => section.items.length > 0);
    }, [items]);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    if (!isAuthenticated) return null;

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markReadMutation.mutate(notification.id);
        }
    };

    const handleMarkAllRead = () => {
        if (unreadCount > 0) {
            markAllMutation.mutate();
        }
    };

    const handleLoadMore = () => {
        if (!hasMore || isFetching) return;
        setPage((prev) => prev + 1);
    };

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                className="hidden md:flex flex-col items-center space-y-2 p-2 text-white transition-all duration-150 hover:scale-120 hover:brightness-125 bg-transparent"
                onClick={onToggle}
                aria-expanded={isOpen}
                aria-label="Notifications"
            >
                <IconWithBadge
                    Icon={FaBell}
                    badgeValue={unreadCount}
                    iconClassName="text-white text-xl scale-110"
                />
                <span className="text-xs font-normal">Notifications</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="notification-panel"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed left-0 right-0 top-0 z-90 flex h-[50dvh] w-full flex-col overflow-hidden theme-dropdown shadow-lg rounded-none md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:h-auto md:w-[min(92vw,22rem)] md:rounded-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[var(--theme-border-subtle)] theme-section shrink-0">
                            <h3 className="text-sm font-semibold theme-text">Notifications</h3>
                            <div className="flex items-center gap-2 shrink-0">
                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        className="text-xs theme-text-teal bg-transparent hover:brightness-125 px-1"
                                        onClick={handleMarkAllRead}
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="md:hidden flex items-center justify-center p-1.5 rounded-sm bg-[var(--theme-red)] text-white border-0 hover:brightness-110"
                                    onClick={onClose}
                                    style={{ backgroundColor: '#b91c1c', borderColor: 'transparent', color: '#ffffff' }}
                                    aria-label="Close notifications"
                                >
                                    <FaTimes className="text-sm" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 px-3 py-2 border-b border-[var(--theme-border-subtle)] theme-section shrink-0">
                            <div className="flex items-center gap-2">
                                <FilterChip
                                    label="Normal"
                                    active={priorityFilter === Priority.NORMAL}
                                    onClick={() => togglePriority(Priority.NORMAL)}
                                />
                                <FilterChip
                                    label="Urgent"
                                    active={priorityFilter === Priority.URGENT}
                                    onClick={() => togglePriority(Priority.URGENT)}
                                />
                            </div>

                            {showAudienceFilters && roleAudience && (
                                <div className="flex items-center gap-2">
                                    <FilterChip
                                        label="Personal"
                                        active={audienceFilter === NotificationAudience.USER}
                                        onClick={() =>
                                            selectAudience(NotificationAudience.USER)
                                        }
                                    />
                                    <FilterChip
                                        label={AUDIENCE_LABELS[roleAudience]}
                                        active={audienceFilter === roleAudience}
                                        onClick={() => selectAudience(roleAudience)}
                                    />
                                </div>
                            )}
                        </div>

                        <div
                            className={`overflow-y-auto flex-1 min-h-0 ${MD_LIST_HEIGHT}`}
                        >
                            {(isLoading ||
                                (isFetching && page === 1) ||
                                !audienceFilter) &&
                            items.length === 0 ? (
                                <div
                                    className="flex h-full min-h-[10rem] w-full items-center justify-center"
                                    role="status"
                                    aria-live="polite"
                                    aria-label="Loading notifications"
                                >
                                    <FaSpinner
                                        className="text-3xl md:text-4xl theme-text-teal animate-spin"
                                        aria-hidden
                                    />
                                </div>
                            ) : items.length === 0 ? (
                                <div className="flex h-full min-h-[10rem] flex-col items-center justify-center gap-2 px-4">
                                    <FaBell className="text-2xl theme-text-subtle opacity-60" />
                                    <p className="text-sm font-medium theme-text text-center">
                                        {emptyCopy.title}
                                    </p>
                                    <p className="text-xs theme-text-muted text-center">
                                        {emptyCopy.subtitle}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {grouped.map((section) => (
                                        <section
                                            key={section.audience}
                                            className="border-b border-[var(--theme-border-subtle)] last:border-b-0"
                                        >
                                            <h4 className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide theme-text-muted theme-card sticky top-0">
                                                {section.label}
                                            </h4>
                                            <ul className="flex flex-col">
                                                {section.items.map((notification) => (
                                                    <li key={notification.id}>
                                                        <button
                                                            type="button"
                                                            className={`w-full text-left px-3 py-2.5 border-b border-[var(--theme-border-subtle)] last:border-b-0 bg-transparent hover:brightness-95 transition ${
                                                                notification.isRead
                                                                    ? "opacity-75"
                                                                    : "theme-card"
                                                            }`}
                                                            onClick={() =>
                                                                handleNotificationClick(
                                                                    notification
                                                                )
                                                            }
                                                        >
                                                            <div className="flex items-start justify-between gap-2">
                                                                <p className="text-sm line-clamp-3 text-left">
                                                                    {renderColoredContent(
                                                                        notification.content
                                                                    )}
                                                                </p>
                                                                {!notification.isRead && (
                                                                    <span className="mt-1 shrink-0 w-2 h-2 rounded-full bg-[var(--theme-red)]" />
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] theme-text-subtle mt-1">
                                                                {formatRelativeTime(
                                                                    notification.createdAt
                                                                )}
                                                                {notification.notificationPriority ===
                                                                    Priority.URGENT && (
                                                                    <span className="ml-2 text-[var(--theme-red)] font-semibold">
                                                                        Urgent
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    ))}

                                    {hasMore && (
                                        <div className="p-3 border-t border-[var(--theme-border-subtle)]">
                                            <button
                                                type="button"
                                                className="w-full py-2 text-sm theme-btn-teal text-white rounded-sm disabled:opacity-60 inline-flex items-center justify-center gap-2"
                                                onClick={handleLoadMore}
                                                disabled={isFetching}
                                            >
                                                {isFetching ? (
                                                    <FaSpinner
                                                        className="text-base animate-spin"
                                                        aria-hidden
                                                    />
                                                ) : (
                                                    "Load more"
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export { AUDIENCE_LABELS, formatDisplayUsername };
