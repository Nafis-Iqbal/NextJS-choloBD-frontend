"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaStar, FaTrash } from "react-icons/fa";
import { BookmarkApi } from "@/services/api";
import { BookmarkType } from "@/types/enums";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { PaginationControls } from "./PaginationControls";

export type Trip = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  destination: string;
  status: "ongoing" | "upcoming";
  members: number;
};

const PAGE_SIZE = 30;

interface BookmarkSectionConfig {
  type: BookmarkType;
  tabLabel: string;
  title: string;
  emptyLabel: string;
}

const BOOKMARK_SECTIONS: BookmarkSectionConfig[] = [
  {
    type: BookmarkType.HOTEL,
    tabLabel: "Hotels",
    title: "Bookmarked Hotels",
    emptyLabel: "No bookmarked hotels yet",
  },
  {
    type: BookmarkType.ACTIVITY_SPOT,
    tabLabel: "Activity Spots",
    title: "Bookmarked Activity Spots",
    emptyLabel: "No bookmarked activity spots yet",
  },
  {
    type: BookmarkType.TOUR_SPOT,
    tabLabel: "Tour Spots",
    title: "Bookmarked Tour Spots",
    emptyLabel: "No bookmarked tour spots yet",
  },
  {
    type: BookmarkType.GUIDE,
    tabLabel: "Guides",
    title: "Bookmarked Guides",
    emptyLabel: "No bookmarked guides yet",
  },
];

interface BookmarkAsset {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  location?: { name?: string };
  images?: { url?: string }[];
}

interface BookmarkListItem {
  id: string;
  bookmarkType: BookmarkType;
  bookmarkAssetId: string;
  displayName?: string | null;
  href?: string;
  asset?: BookmarkAsset | null;
}

function resolveBookmarkName(bookmark: BookmarkListItem): string {
  if (bookmark.displayName) return bookmark.displayName;
  const asset = bookmark.asset;
  if (!asset) return "Unknown";
  if (asset.name) return asset.name;
  const fullName = `${asset.firstName || ""} ${asset.lastName || ""}`.trim();
  return fullName || "Unknown";
}

function resolveBookmarkHref(bookmark: BookmarkListItem): string {
  if (bookmark.href) return bookmark.href;
  const id = bookmark.bookmarkAssetId || bookmark.asset?.id;
  if (!id) return "#";

  switch (bookmark.bookmarkType) {
    case BookmarkType.HOTEL:
      return `/hotels/${id}`;
    case BookmarkType.ACTIVITY_SPOT:
      return `/activity-spots/${id}`;
    case BookmarkType.TOUR_SPOT:
      return `/tour-spots/${id}`;
    case BookmarkType.GUIDE:
      return `/guides/${id}`;
    default:
      return "#";
  }
}

function resolveLocationLabel(bookmark: BookmarkListItem): string | null {
  return bookmark.asset?.location?.name || null;
}

const BookmarkTypeSection: React.FC<{
  config: BookmarkSectionConfig;
}> = ({ config }) => {
  const [page, setPage] = useState(1);
  const { openNotificationPopUpMessage } = useGlobalUI();

  const { data, isLoading, isError, refetch } = BookmarkApi.useGetMyBookmarksRQ({
    bookmarkType: config.type,
    page,
    limit: PAGE_SIZE,
  });

  const results = (data?.data?.results ?? []) as BookmarkListItem[];
  const total = data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const { mutate: deleteBookmark, isPending: isDeleting } =
    BookmarkApi.useDeleteBookmarkRQ(
      (response) => {
        if (response.status === "success") {
          queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
          refetch();
          openNotificationPopUpMessage("Bookmark removed");
        } else {
          openNotificationPopUpMessage(
            response.message || "Failed to remove bookmark"
          );
        }
      },
      () => openNotificationPopUpMessage("Failed to remove bookmark")
    );

  return (
    <section className="mb-0">
      <div
        className="mb-3 md:mb-4 pb-2 md:pb-3 border-b-0 md:border-b"
        style={{ borderColor: "var(--theme-deep-green)" }}
      >
        <h2 className="text-xl sm:text-2xl font-bold theme-text-teal">
          {config.title}
        </h2>
        <p className="theme-text-muted text-sm mt-1">
          {isLoading
            ? "Loading…"
            : `${total} saved ${total === 1 ? "item" : "items"}`}
        </p>
      </div>

      <div
        className="rounded-sm md:rounded-md overflow-y-auto max-h-[80vh] min-h-[40vh] px-0 py-2 md:p-2 border-0 md:border"
        style={{
          backgroundColor: "var(--theme-card-bg)",
          borderColor: "var(--theme-deep-green)",
        }}
      >
        {isLoading ? (
          <div className="rounded-sm p-4 text-center theme-text-subtle">
            Loading bookmarks…
          </div>
        ) : isError ? (
          <div className="rounded-sm p-4 text-center theme-text-subtle">
            Failed to load bookmarks.
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-sm p-4 text-center theme-text-subtle">
            {config.emptyLabel}
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((bookmark) => {
              const name = resolveBookmarkName(bookmark);
              const href = resolveBookmarkHref(bookmark);
              const location = resolveLocationLabel(bookmark);
              const imageUrl = bookmark.asset?.images?.[0]?.url;

              return (
                <div
                  key={bookmark.id}
                  className="rounded-sm md:rounded p-2 md:p-3 transition-colors overflow-hidden border-0 md:border"
                  style={{
                    backgroundColor: "var(--theme-bg)",
                    borderColor: "var(--theme-deep-green)",
                  }}
                >
                  <div className="flex flex-col gap-2 md:gap-3 md:flex-row md:items-start md:justify-between min-w-0">
                    <Link
                      href={href}
                      className="flex items-start gap-2 md:gap-3 min-w-0 flex-1 bg-transparent hover:opacity-90 active:opacity-75"
                    >
                      {imageUrl ? (
                        <div
                          className="w-12 h-12 md:w-14 md:h-14 rounded-sm overflow-hidden shrink-0 border-0 md:border"
                          style={{
                            backgroundColor: "var(--theme-section-bg)",
                            borderColor: "var(--theme-deep-green)",
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageUrl}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-12 h-12 md:w-14 md:h-14 rounded-sm flex items-center justify-center shrink-0 border-0 md:border"
                          style={{
                            backgroundColor: "var(--theme-section-bg)",
                            borderColor: "var(--theme-deep-green)",
                          }}
                        >
                          <FaStar className="text-base md:text-lg theme-star" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold theme-text break-words line-clamp-2">
                          {name}
                        </p>
                        <div className="theme-text-subtle text-sm mt-1 flex flex-col gap-0.5 sm:block">
                          {location && (
                            <span className="break-words">📍 {location}</span>
                          )}
                        </div>
                        <p className="theme-text-subtle text-xs mt-1">
                          Tap to view details
                        </p>
                      </div>
                    </Link>

                    <div className="w-full md:w-auto md:min-w-[8rem] flex flex-col gap-2 min-w-0 sm:items-end">
                      <span
                        className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-3 py-1.5 md:py-1 text-xs rounded-sm font-medium border-0 md:border"
                        style={{
                          backgroundColor: "var(--theme-section-bg)",
                          color: "var(--theme-star)",
                          borderColor: "var(--theme-star)",
                        }}
                      >
                        <FaStar className="text-[10px]" />
                        Bookmarked
                      </span>

                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => deleteBookmark(bookmark.id)}
                        className="w-full sm:w-auto px-3 py-1.5 md:py-1 text-white text-xs rounded-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5"
                        style={{
                          backgroundColor: "var(--theme-red, #dc2626)",
                        }}
                        title="Remove bookmark"
                        aria-label={`Remove bookmark for ${name}`}
                      >
                        <FaTrash className="text-[10px]" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </section>
  );
};

/** Trips list used by the Active & Ongoing tab (kept for existing callers). */
export const TripsSection: React.FC<{
  trips: Trip[];
  title: string;
  className?: string;
  showFakeData?: boolean;
  id?: string;
}> = ({ trips, title, className, id }) => {
  if (!trips || trips.length === 0) {
    return (
      <section className={`mb-8 ${className || ""}`} id={id}>
        <h2 className="text-xl sm:text-2xl font-bold theme-text mb-4">{title}</h2>
        <div className="theme-card rounded-xl p-6 text-center theme-text-subtle">
          No {title.toLowerCase()} at the moment
        </div>
      </section>
    );
  }

  return (
    <section className={`mb-8 ${className || ""}`} id={id}>
      <h2 className="text-xl sm:text-2xl font-bold theme-text mb-4">{title}</h2>
      <div
        className="rounded-xl overflow-y-auto max-h-[80vh] md:max-h-[50vh] min-h-[40vh] p-3 sm:p-4"
        style={{
          backgroundColor: "var(--theme-card-bg)",
          border: "1px solid var(--theme-deep-green)",
        }}
      >
        <div className="space-y-3">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="rounded-xl p-3 sm:p-4 overflow-hidden transition-colors"
              style={{
                backgroundColor: "var(--theme-bg)",
                border: "1px solid var(--theme-deep-green)",
              }}
            >
              <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-start md:justify-between min-w-0">
                <div className="flex-1 min-w-0">
                  <h3 className="theme-text font-semibold text-base sm:text-lg break-words">
                    {trip.title}
                  </h3>
                  <p className="theme-text-teal text-sm mt-1 break-words">
                    📍 {trip.destination}
                  </p>
                  <div className="theme-text-subtle text-sm mt-2 flex flex-col gap-0.5 sm:block">
                    <span>
                      {trip.startDate} to {trip.endDate}
                    </span>
                    <span className="hidden sm:inline"> • </span>
                    <span>{trip.members} members</span>
                  </div>
                </div>
                <div className="w-full md:w-auto shrink-0">
                  <span
                    className={`inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium ${
                      trip.status === "ongoing"
                        ? "bg-orange-600/30 text-orange-900 border border-orange-600/50"
                        : "bg-blue-600/30 text-blue-900 border border-blue-600/50"
                    }`}
                  >
                    {trip.status === "ongoing" ? "🔴 Ongoing" : "📅 Upcoming"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const BookmarksSection: React.FC<{
  className?: string;
  id?: string;
}> = ({ className, id = "bookmarks_section" }) => {
  const [activeTab, setActiveTab] = useState<BookmarkType>(
    BOOKMARK_SECTIONS[0].type
  );

  const currentSection =
    BOOKMARK_SECTIONS.find((section) => section.type === activeTab) ||
    BOOKMARK_SECTIONS[0];

  return (
    <div className={`${className || ""}`} id={id}>
      <div
        className="rounded-none md:rounded-md bg-section overflow-hidden border-0 md:border"
        style={{ borderColor: "var(--theme-deep-green)" }}
      >
        <div
          className="flex flex-wrap md:flex-nowrap gap-1 px-0 py-1.5 md:px-2 md:py-2 border-b-0 md:border-b"
          style={{
            borderColor: "var(--theme-deep-green)",
            backgroundColor:
              "var(--theme-sub-section-bg, var(--theme-card-bg))",
          }}
          role="tablist"
          aria-label="Bookmark categories"
        >
          {BOOKMARK_SECTIONS.map((section) => {
            const isSelected = activeTab === section.type;

            return (
              <button
                key={section.type}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveTab(section.type)}
                className="flex-1 min-w-[100px] px-2 py-2 md:px-3 md:py-2.5 rounded-sm text-sm md:text-base font-semibold transition-all"
                style={
                  isSelected
                    ? {
                        backgroundColor: "var(--theme-teal)",
                        color: "#ffffff",
                      }
                    : {
                        backgroundColor: "transparent",
                        color: "var(--theme-text-muted)",
                      }
                }
                onMouseEnter={(e) => {
                  if (isSelected) return;
                  e.currentTarget.style.backgroundColor =
                    "var(--theme-card-bg)";
                  e.currentTarget.style.color = "var(--theme-text)";
                }}
                onMouseLeave={(e) => {
                  if (isSelected) return;
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--theme-text-muted)";
                }}
              >
                {section.tabLabel}
              </button>
            );
          })}
        </div>

        <div className="py-2 px-0 md:px-3 md:py-3" role="tabpanel">
          <BookmarkTypeSection config={currentSection} />
        </div>
      </div>
    </div>
  );
};
