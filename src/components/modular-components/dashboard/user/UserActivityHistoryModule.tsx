"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { HotelBookingApi, GuideBookingApi, ActivitySpotBookingApi } from "@/services/api";

import { StatsOverview, type Stats } from "./StatsOverview";
import { BookmarksSection, TripsSection, type Trip } from "./BookmarksSection";
import { BookedHotelsSection } from "./BookedHotelsSection";
import { BookedTransportSection, type TransportBooking } from "./BookedTransportSection";
import { BookedActivitySection } from "./BookedActivitySection";
import { BookedGuideSection } from "./BookedGuideSection";
import { HotelBookingHistorySection } from "./HotelBookingHistorySection";
import { ActivityBookingHistorySection } from "./ActivityBookingHistorySection";
import { GuideBookingHistorySection } from "./GuideBookingHistorySection";
import { TransportBookingHistorySection } from "./TransportBookingHistorySection";
import { TransactionHistorySection, type Transaction } from "./TransactionHistorySection";
import { SubmittedComplaintsSection } from "./SubmittedComplaintsSection";
import {
  FAKE_ONGOING_TRIPS,
  FAKE_UPCOMING_TRIPS,
  FAKE_BOOKED_TRANSPORT,
  FAKE_TRANSPORT_BOOKING_HISTORY,
  FAKE_STATS,
} from "./fakeUserActivityData";

export type ActivityTabId = "active" | "booked" | "history" | "bookmarks";
type HistoryTabId =
  | "transactions"
  | "hotels"
  | "transport"
  | "activities"
  | "guides";
type BookedTabId = "hotels" | "transport" | "activities" | "guides";

interface ActivityTab {
  id: ActivityTabId;
  label: string;
  description: string;
  hash: string;
}

interface HistoryTab {
  id: HistoryTabId;
  label: string;
  hash: string;
}

interface BookedTab {
  id: BookedTabId;
  label: string;
  hash: string;
}

interface HashRoute {
  tab: ActivityTabId;
  booked?: BookedTabId;
  history?: HistoryTabId;
  /** Scroll-only targets that sit outside the main tab panels */
  scrollOnly?: boolean;
}

export const ACTIVITY_TABS: ActivityTab[] = [
  {
    id: "active",
    label: "Active & Ongoing",
    description: "Trips and activities you are currently on",
    hash: "user_activity_active",
  },
  {
    id: "booked",
    label: "Booked",
    description: "Confirmed hotel and transport reservations",
    hash: "user_activity_booked",
  },
  {
    id: "history",
    label: "History",
    description: "Past transactions and completed bookings",
    hash: "user_activity_history",
  },
  {
    id: "bookmarks",
    label: "Bookmarks",
    description: "Saved hotels, activities, tour spots, and guides",
    hash: "bookmarks_section",
  },
];

const HISTORY_TABS: HistoryTab[] = [
  { id: "transactions", label: "Transactions", hash: "user_activity_transactions" },
  { id: "hotels", label: "Hotels", hash: "user_activity_history_hotels" },
  { id: "transport", label: "Transports", hash: "user_activity_history_transport" },
  { id: "activities", label: "Activities", hash: "user_activity_history_activities" },
  { id: "guides", label: "Guides", hash: "user_activity_history_guides" },
];

const BOOKED_TABS: BookedTab[] = [
  { id: "hotels", label: "Hotels", hash: "booked_hotels_section" },
  { id: "transport", label: "Transport", hash: "user_activity_booked_transport" },
  { id: "activities", label: "Activities", hash: "booked_activities_section" },
  { id: "guides", label: "Guides", hash: "booked_guides_section" },
];

const HASH_ROUTES: Record<string, HashRoute> = {
  activity_history: { tab: "active" },
  user_activity_active: { tab: "active" },
  user_activity_booked: { tab: "booked" },
  user_activity_booked_hotels: { tab: "booked", booked: "hotels" },
  booked_hotels_section: { tab: "booked", booked: "hotels" },
  user_activity_booked_transport: { tab: "booked", booked: "transport" },
  user_activity_booked_activities: { tab: "booked", booked: "activities" },
  booked_activities_section: { tab: "booked", booked: "activities" },
  user_activity_booked_guides: { tab: "booked", booked: "guides" },
  booked_guides_section: { tab: "booked", booked: "guides" },
  user_activity_history: { tab: "history" },
  user_activity_transactions: { tab: "history", history: "transactions" },
  user_activity_history_hotels: { tab: "history", history: "hotels" },
  user_activity_history_transport: { tab: "history", history: "transport" },
  user_activity_history_activities: { tab: "history", history: "activities" },
  user_activity_history_guides: { tab: "history", history: "guides" },
  user_activity_bookmarks: { tab: "bookmarks" },
  bookmarks_section: { tab: "bookmarks" },
  submitted_complaints_section: { tab: "active", scrollOnly: true },
};

function getLocationHash(): string {
  if (typeof window === "undefined") return "";
  return window.location.hash.replace(/^#/, "");
}

function scrollToHashTarget(hash: string): boolean {
  if (!hash) return false;
  const el = document.getElementById(hash);
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

/** Keep viewport still when swapping tabs (hash may still match a newly mounted id). */
function preserveViewportScroll() {
  const y = window.scrollY;
  const restore = () => window.scrollTo(0, y);
  restore();
  requestAnimationFrame(restore);
  window.setTimeout(restore, 0);
  window.setTimeout(restore, 50);
}

function resolveInitialTabs() {
  return {
    tab: "active" as ActivityTabId,
    booked: "hotels" as BookedTabId,
    history: "transactions" as HistoryTabId,
  };
}

interface UserActivityHistoryModuleProps {
  userId?: string;
  ongoingTrips?: Trip[];
  upcomingTrips?: Trip[];
  bookedHotels?: HotelRoomBooking[];
  bookedTransport?: TransportBooking[];
  bookedGuides?: GuideBooking[];
  bookedActivities?: ActivityBooking[];
  transactionHistory?: Transaction[];
  hotelBookingHistory?: HotelRoomBooking[];
  activityBookingHistory?: ActivityBooking[];
  guideBookingHistory?: GuideBooking[];
  transportBookingHistory?: TransportBooking[];
  stats?: Stats;
}

function normalizeActivityBookings(
  data:
    | ActivityBooking[]
    | { data?: ActivityBooking[]; results?: ActivityBooking[] }
    | null
    | undefined
): ActivityBooking[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results || data.data || [];
}

export const UserActivityHistoryModule: React.FC<UserActivityHistoryModuleProps> = ({
  userId,
  ongoingTrips = FAKE_ONGOING_TRIPS,
  upcomingTrips = FAKE_UPCOMING_TRIPS,
  bookedHotels,
  bookedTransport = FAKE_BOOKED_TRANSPORT,
  bookedGuides,
  bookedActivities,
  transactionHistory,
  hotelBookingHistory,
  activityBookingHistory,
  guideBookingHistory,
  transportBookingHistory = FAKE_TRANSPORT_BOOKING_HISTORY,
  stats = FAKE_STATS,
}) => {
  const initialTabs = resolveInitialTabs();
  const [activeTab, setActiveTab] = useState<ActivityTabId>(initialTabs.tab);
  const [activeHistoryTab, setActiveHistoryTab] =
    useState<HistoryTabId>(initialTabs.history);
  const [activeBookedTab, setActiveBookedTab] = useState<BookedTabId>(initialTabs.booked);

  const { data: hotelBookingsResponse } = HotelBookingApi.useGetBookingsRQ(
    userId ? `userId=${userId}` : undefined
  );

  const fetchedHotelBookings = React.useMemo(() => {
    if (!hotelBookingsResponse?.data) {
      return [];
    }

    return Array.isArray(hotelBookingsResponse.data)
      ? hotelBookingsResponse.data
      : hotelBookingsResponse.data.data || [];
  }, [hotelBookingsResponse?.data]);

  const { data: guideBookingsResponse } = GuideBookingApi.useGetGuideBookingsRQ(
    userId ? `userId=${userId}` : undefined
  );

  const fetchedGuideBookings = React.useMemo(() => {
    if (!guideBookingsResponse?.data) {
      return [];
    }

    return Array.isArray(guideBookingsResponse.data)
      ? guideBookingsResponse.data
      : guideBookingsResponse.data.results || [];
  }, [guideBookingsResponse?.data]);

  const { data: activityBookingsResponse } =
    ActivitySpotBookingApi.useGetActivityBookingsRQ(
      userId ? { userId, limit: 100 } : undefined
    );

  const fetchedActivityBookings = React.useMemo(
    () => normalizeActivityBookings(activityBookingsResponse?.data),
    [activityBookingsResponse?.data]
  );

  const currentTab = ACTIVITY_TABS.find((tab) => tab.id === activeTab) || ACTIVITY_TABS[0];

  /**
   * Tab clicks = React state only (no URL writes) + preserve scroll.
   * Sidebar hash links = switch tab/sub-tab, then scroll to that section id.
   */
  const pendingMenuScrollHashRef = useRef<string | null>(null);

  const applyHashFromUrl = useCallback((options?: { scroll?: boolean }) => {
    const hash = getLocationHash();
    if (!hash || !HASH_ROUTES[hash]) return;

    const route = HASH_ROUTES[hash];

    if (!route.scrollOnly) {
      setActiveTab(route.tab);
      if (route.booked) setActiveBookedTab(route.booked);
      if (route.history) setActiveHistoryTab(route.history);
    }

    if (options?.scroll) {
      pendingMenuScrollHashRef.current = hash;

      // Always-mounted targets (e.g. complaints), or panel already visible
      window.setTimeout(() => {
        if (
          pendingMenuScrollHashRef.current === hash &&
          scrollToHashTarget(hash)
        ) {
          pendingMenuScrollHashRef.current = null;
        }
      }, 0);
    }
  }, []);

  const handleMainTabChange = useCallback((tabId: ActivityTabId) => {
    pendingMenuScrollHashRef.current = null;
    preserveViewportScroll();
    setActiveTab(tabId);
  }, []);

  const handleBookedTabChange = useCallback((tabId: BookedTabId) => {
    pendingMenuScrollHashRef.current = null;
    preserveViewportScroll();
    setActiveBookedTab(tabId);
  }, []);

  const handleHistoryTabChange = useCallback((tabId: HistoryTabId) => {
    pendingMenuScrollHashRef.current = null;
    preserveViewportScroll();
    setActiveHistoryTab(tabId);
  }, []);

  useEffect(() => {
    applyHashFromUrl({ scroll: true });

    const onMenuHashNav = () => applyHashFromUrl({ scroll: true });
    window.addEventListener("hashchange", onMenuHashNav);
    window.addEventListener("popstate", onMenuHashNav);

    const { pushState, replaceState } = window.history;
    const hashFromHistoryUrl = (url: string | URL | null | undefined) => {
      const urlStr = typeof url === "string" ? url : url?.toString?.() ?? "";
      if (!urlStr.includes("#")) return "";
      return urlStr.split("#")[1]?.split("?")[0] ?? "";
    };

    const notifyIfKnownHash = (url: string | URL | null | undefined) => {
      const hash = hashFromHistoryUrl(url);
      if (!hash || !HASH_ROUTES[hash]) return;
      window.setTimeout(() => applyHashFromUrl({ scroll: true }), 0);
    };

    window.history.pushState = function (...args) {
      const result = pushState.apply(this, args);
      notifyIfKnownHash(args[2] as string | URL | null | undefined);
      return result;
    };
    window.history.replaceState = function (...args) {
      const result = replaceState.apply(this, args);
      notifyIfKnownHash(args[2] as string | URL | null | undefined);
      return result;
    };

    return () => {
      window.removeEventListener("hashchange", onMenuHashNav);
      window.removeEventListener("popstate", onMenuHashNav);
      window.history.pushState = pushState;
      window.history.replaceState = replaceState;
    };
  }, [applyHashFromUrl]);

  // Sidebar only: scroll to the target after the matching panel has mounted
  useEffect(() => {
    const hash = pendingMenuScrollHashRef.current;
    if (!hash) return;

    const tryScroll = () => {
      if (scrollToHashTarget(hash)) {
        pendingMenuScrollHashRef.current = null;
        return true;
      }
      return false;
    };

    if (tryScroll()) return;

    const t1 = window.setTimeout(tryScroll, 50);
    const t2 = window.setTimeout(() => {
      tryScroll();
      pendingMenuScrollHashRef.current = null;
    }, 200);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [activeTab, activeBookedTab, activeHistoryTab]);

  return (
    <div className="w-full theme-text min-h-screen md:p-4" id="activity_history">
      <div className="max-w-7xl w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold theme-text">My Activity & History</h1>
          <p className="theme-text-muted mt-2">
            View your trips, bookings, and activity overview
          </p>
        </div>

        <StatsOverview
          stats={stats}
          className="rounded-md mb-8"
          showFakeData={true}
        />

        <div className="rounded-xl theme-outline bg-section overflow-hidden min-h-screen">
          <div
            className="flex flex-wrap md:flex-nowrap gap-1 p-2 md:p-3 border-b"
            style={{
              borderColor: "var(--theme-deep-green)",
              backgroundColor: "var(--theme-sub-section-bg, var(--theme-card-bg))",
            }}
            role="tablist"
            aria-label="Activity sections"
          >
            {ACTIVITY_TABS.map((tab) => {
              const isSelected = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleMainTabChange(tab.id)}
                  className="flex-1 min-w-[140px] px-3 py-2.5 md:px-4 md:py-3 rounded-lg text-sm md:text-base font-semibold transition-all"
                  style={
                    isSelected
                      ? {
                          backgroundColor: "var(--theme-teal)",
                          color: "#ffffff",
                          boxShadow: "0 0 0 1px var(--theme-teal)",
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
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="py-4 px-2 md:p-6" role="tabpanel">
            <div
              className="mb-5 pb-4 border-b"
              style={{ borderColor: "var(--theme-deep-green)" }}
            >
              <h2 className="text-2xl font-bold theme-text-teal">{currentTab.label}</h2>
              <p className="theme-text-muted text-sm mt-1">{currentTab.description}</p>
            </div>

            <div className="space-y-2">
              {activeTab === "active" && (
                <TripsSection
                  trips={ongoingTrips}
                  title="Ongoing Trips"
                  id="user_activity_active"
                  className="scroll-mt-24 p-1 rounded-md mb-0"
                  showFakeData={true}
                />
              )}

              {activeTab === "booked" && (
                <div
                  id="user_activity_booked"
                  className="scroll-mt-24 rounded-none md:rounded-md bg-section overflow-hidden border-0 md:border"
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
                    aria-label="Booked categories"
                  >
                    {BOOKED_TABS.map((tab) => {
                      const isSelected = activeBookedTab === tab.id;

                      return (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          aria-selected={isSelected}
                          onClick={() => handleBookedTabChange(tab.id)}
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
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.color =
                              "var(--theme-text-muted)";
                          }}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="py-2 px-0 md:px-3 md:py-3" role="tabpanel">
                    {activeBookedTab === "hotels" && (
                      <BookedHotelsSection
                        hotels={bookedHotels || fetchedHotelBookings}
                        userId={userId}
                        className="p-0 mb-0"
                        showFakeData={false}
                      />
                    )}

                    {activeBookedTab === "transport" && (
                      <BookedTransportSection
                        transports={bookedTransport}
                        className="p-0 mb-0"
                        showFakeData={true}
                      />
                    )}

                    {activeBookedTab === "activities" && (
                      <BookedActivitySection
                        activities={
                          bookedActivities || fetchedActivityBookings
                        }
                        userId={userId}
                        className="p-0 mb-0"
                        showFakeData={false}
                      />
                    )}

                    {activeBookedTab === "guides" && (
                      <BookedGuideSection
                        guides={bookedGuides || fetchedGuideBookings}
                        userId={userId}
                        className="p-0 mb-0"
                        showFakeData={false}
                      />
                    )}
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div
                  id="user_activity_history"
                  className="scroll-mt-24 rounded-none md:rounded-md bg-section overflow-hidden border-0 md:border"
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
                    aria-label="History categories"
                  >
                    {HISTORY_TABS.map((tab) => {
                      const isSelected = activeHistoryTab === tab.id;

                      return (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          aria-selected={isSelected}
                          onClick={() => handleHistoryTabChange(tab.id)}
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
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.color =
                              "var(--theme-text-muted)";
                          }}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="py-2 px-0 md:px-3 md:py-3" role="tabpanel">
                    {activeHistoryTab === "transactions" && (
                      <TransactionHistorySection
                        transactions={transactionHistory}
                        id="user_activity_transactions"
                        className="scroll-mt-24 p-0 mb-0"
                        showFakeData={false}
                      />
                    )}

                    {activeHistoryTab === "hotels" && (
                      <div id="user_activity_history_hotels" className="scroll-mt-24">
                        <HotelBookingHistorySection
                          userId={userId}
                          bookings={hotelBookingHistory || fetchedHotelBookings}
                          className="p-0 mb-0"
                          showFakeData={false}
                        />
                      </div>
                    )}

                    {activeHistoryTab === "transport" && (
                      <div id="user_activity_history_transport" className="scroll-mt-24">
                        <TransportBookingHistorySection
                          bookings={transportBookingHistory}
                          className="p-0 mb-0"
                          showFakeData={true}
                        />
                      </div>
                    )}

                    {activeHistoryTab === "activities" && (
                      <div id="user_activity_history_activities" className="scroll-mt-24">
                        <ActivityBookingHistorySection
                          userId={userId}
                          bookings={
                            activityBookingHistory || fetchedActivityBookings
                          }
                          className="p-0 mb-0"
                          showFakeData={false}
                        />
                      </div>
                    )}

                    {activeHistoryTab === "guides" && (
                      <div id="user_activity_history_guides" className="scroll-mt-24">
                        <GuideBookingHistorySection
                          userId={userId}
                          bookings={guideBookingHistory || fetchedGuideBookings}
                          className="p-0 mb-0"
                          showFakeData={false}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "bookmarks" && (
                <BookmarksSection
                  id="bookmarks_section"
                  className="scroll-mt-24 p-1 rounded-md mb-0"
                />
              )}
            </div>
          </div>
        </div>

        <SubmittedComplaintsSection className="scroll-mt-24" />
      </div>
    </div>
  );
};
