"use client";

import { useRouter } from "next/navigation";
import { FaStar } from "react-icons/fa";
import { AuthApi, BookmarkApi } from "@/services/api";
import { BookmarkType } from "@/types/enums";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";

export function BookmarkPageButton({
    bookmarkType,
    bookmarkAssetId,
    className,
}: {
    bookmarkType: BookmarkType;
    bookmarkAssetId: string;
    className?: string;
}) {
    const router = useRouter();
    const { openNotificationPopUpMessage } = useGlobalUI();

    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = !!authResponse?.data?.isAuthenticated;

    const {
        data: checkData,
        isLoading: isCheckLoading,
        refetch: refetchCheck,
    } = BookmarkApi.useCheckBookmarkRQ(
        { bookmarkType, bookmarkAssetId },
        isAuthenticated && !!bookmarkAssetId
    );

    const isBookmarked = !!checkData?.data?.isBookmarked;

    const invalidateBookmarkQueries = () => {
        queryClient.invalidateQueries({
            queryKey: ["bookmarks", "check", bookmarkType, bookmarkAssetId],
        });
        queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
        refetchCheck();
    };

    const { mutate: createBookmark, isPending: isCreating } =
        BookmarkApi.useCreateBookmarkRQ(
            (response) => {
                if (response.status === "success") {
                    invalidateBookmarkQueries();
                    openNotificationPopUpMessage("Page bookmarked");
                } else {
                    openNotificationPopUpMessage(
                        response.message || "Failed to bookmark this page"
                    );
                }
            },
            () => {
                openNotificationPopUpMessage("Failed to bookmark this page");
            }
        );

    const { mutate: deleteBookmarkByAsset, isPending: isDeleting } =
        BookmarkApi.useDeleteBookmarkByAssetRQ(
            (response) => {
                if (response.status === "success") {
                    invalidateBookmarkQueries();
                    openNotificationPopUpMessage("Bookmark removed");
                } else {
                    openNotificationPopUpMessage(
                        response.message || "Failed to remove bookmark"
                    );
                }
            },
            () => {
                openNotificationPopUpMessage("Failed to remove bookmark");
            }
        );

    const isBusy = isCreating || isDeleting || isCheckLoading;

    const handleClick = () => {
        if (!bookmarkAssetId) return;

        if (!isAuthenticated) {
            openNotificationPopUpMessage("Please log in to bookmark this page");
            router.push("/login");
            return;
        }

        if (isBusy) return;

        if (isBookmarked) {
            deleteBookmarkByAsset({ bookmarkType, bookmarkAssetId });
        } else {
            createBookmark({ bookmarkType, bookmarkAssetId });
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isBusy}
            className={`inline-flex items-center gap-1.5 bg-transparent p-0 text-xs theme-text-muted hover:opacity-80 transition-opacity duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-wait ${className || ""}`}
            aria-pressed={isBookmarked}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this page"}
            title={isBookmarked ? "Remove bookmark" : "Bookmark this page"}
        >
            <FaStar
                className="text-lg md:text-2xl shrink-0"
                style={{
                    color: isBookmarked ? "#EAB308" : "#D1D5DB",
                }}
            />
            <span className="text-xs md:text-sm leading-none">
                {isBookmarked ? "Bookmarked" : "Bookmark this"}
            </span>
        </button>
    );
}
