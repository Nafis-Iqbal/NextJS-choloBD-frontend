"use client";

import { useEffect, useRef, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FaBell } from "react-icons/fa";
import { AuthApi, NotificationApi } from "@/services/api";
import { NotificationAudience } from "@/types/enums";
import IconWithBadge from "../custom-elements/IconWithBadge";

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

type NotificationDropdownProps = {
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
};

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

export default function NotificationDropdown({
    isOpen,
    onToggle,
    onClose,
}: NotificationDropdownProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const invalidateNotifications = () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;

    const { data: unreadResponse } = NotificationApi.useGetUnreadNotificationCountRQ(
        isAuthenticated
    );
    const unreadCount = unreadResponse?.data?.count ?? 0;

    const { data: listResponse, isLoading, isFetching } =
        NotificationApi.useGetMyNotificationsRQ(
            { page: 1, limit: 30 },
            isAuthenticated && isOpen
        );

    const markReadMutation = NotificationApi.useMarkNotificationAsReadRQ(
        invalidateNotifications,
        () => {}
    );

    const markAllMutation = NotificationApi.useMarkAllNotificationsAsReadRQ(
        invalidateNotifications,
        () => {}
    );

    const notifications = listResponse?.data?.results ?? [];

    const grouped = useMemo(() => {
        const map = new Map<NotificationAudience, Notification[]>();
        for (const audience of AUDIENCE_ORDER) {
            map.set(audience, []);
        }
        for (const n of notifications) {
            const key = n.notificationAudience as NotificationAudience;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(n);
        }
        return AUDIENCE_ORDER.map((audience) => ({
            audience,
            label: AUDIENCE_LABELS[audience],
            items: map.get(audience) ?? [],
        })).filter((section) => section.items.length > 0);
    }, [notifications]);

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

    return (
        <div ref={containerRef} className="relative hidden md:block">
            <button
                type="button"
                className="flex flex-col items-center space-y-2 p-2 text-white transition-all duration-150 hover:scale-120 hover:brightness-125 bg-transparent"
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

            {isOpen && (
                <div
                    className="absolute top-full right-0 mt-2 z-90 w-[min(92vw,22rem)] max-h-[70vh] flex flex-col theme-dropdown rounded-md shadow-lg overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[var(--theme-border-subtle)] theme-section shrink-0">
                        <h3 className="text-sm font-semibold theme-text">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                className="text-xs theme-text-teal bg-transparent hover:brightness-125 px-1"
                                onClick={handleMarkAllRead}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto flex-1 min-h-0">
                        {(isLoading || isFetching) && notifications.length === 0 ? (
                            <p className="p-4 text-sm text-center theme-text-muted">
                                Loading notifications…
                            </p>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10">
                                <FaBell className="text-2xl theme-text-subtle opacity-60" />
                                <p className="text-sm font-medium theme-text text-center">
                                    No notifications yet
                                </p>
                                <p className="text-xs theme-text-muted text-center">
                                    Updates about bookings, payments, and account activity will show up here.
                                </p>
                            </div>
                        ) : (
                            grouped.map((section) => (
                                <section key={section.audience} className="border-b border-[var(--theme-border-subtle)] last:border-b-0">
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
                                                        handleNotificationClick(notification)
                                                    }
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-sm font-semibold theme-text line-clamp-1">
                                                            {notification.title}
                                                        </p>
                                                        {!notification.isRead && (
                                                            <span className="mt-1 shrink-0 w-2 h-2 rounded-full bg-[var(--theme-red)]" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs theme-text-muted line-clamp-2 mt-0.5">
                                                        {notification.content}
                                                    </p>
                                                    <p className="text-[10px] theme-text-subtle mt-1">
                                                        {formatRelativeTime(notification.createdAt)}
                                                        {notification.notificationPriority ===
                                                            "URGENT" && (
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
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export { AUDIENCE_LABELS };
