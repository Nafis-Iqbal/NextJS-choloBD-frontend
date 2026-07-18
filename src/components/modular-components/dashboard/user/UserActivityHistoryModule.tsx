"use client";

import React, { useState } from "react";
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

type ActivityTabId = "active" | "booked" | "history" | "bookmarks";
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
}

interface HistoryTab {
  id: HistoryTabId;
  label: string;
}

interface BookedTab {
  id: BookedTabId;
  label: string;
}

const ACTIVITY_TABS: ActivityTab[] = [
  {
    id: "active",
    label: "Active & Ongoing",
    description: "Trips and activities you are currently on",
  },
  {
    id: "booked",
    label: "Booked",
    description: "Confirmed hotel and transport reservations",
  },
  {
    id: "history",
    label: "History",
    description: "Past transactions and completed bookings",
  },
  {
    id: "bookmarks",
    label: "Bookmarks",
    description: "Saved hotels, activities, tour spots, and guides",
  },
];

const HISTORY_TABS: HistoryTab[] = [
  { id: "transactions", label: "Transactions" },
  { id: "hotels", label: "Hotels" },
  { id: "transport", label: "Transports" },
  { id: "activities", label: "Activities" },
  { id: "guides", label: "Guides" },
];

const BOOKED_TABS: BookedTab[] = [
  { id: "hotels", label: "Hotels" },
  { id: "transport", label: "Transport" },
  { id: "activities", label: "Activities" },
  { id: "guides", label: "Guides" },
];

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
  const [activeTab, setActiveTab] = useState<ActivityTabId>("active");
  const [activeHistoryTab, setActiveHistoryTab] =
    useState<HistoryTabId>("transactions");
  const [activeBookedTab, setActiveBookedTab] = useState<BookedTabId>("hotels");

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
                  onClick={() => setActiveTab(tab.id)}
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
                  className="p-1 rounded-md mb-0"
                  showFakeData={true}
                />
              )}

              {activeTab === "booked" && (
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
                          onClick={() => setActiveBookedTab(tab.id)}
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
                          onClick={() => setActiveHistoryTab(tab.id)}
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
                        className="p-0 mb-0"
                        showFakeData={false}
                      />
                    )}

                    {activeHistoryTab === "hotels" && (
                      <HotelBookingHistorySection
                        userId={userId}
                        bookings={hotelBookingHistory || fetchedHotelBookings}
                        className="p-0 mb-0"
                        showFakeData={false}
                      />
                    )}

                    {activeHistoryTab === "transport" && (
                      <TransportBookingHistorySection
                        bookings={transportBookingHistory}
                        className="p-0 mb-0"
                        showFakeData={true}
                      />
                    )}

                    {activeHistoryTab === "activities" && (
                      <ActivityBookingHistorySection
                        userId={userId}
                        bookings={
                          activityBookingHistory || fetchedActivityBookings
                        }
                        className="p-0 mb-0"
                        showFakeData={false}
                      />
                    )}

                    {activeHistoryTab === "guides" && (
                      <GuideBookingHistorySection
                        userId={userId}
                        bookings={guideBookingHistory || fetchedGuideBookings}
                        className="p-0 mb-0"
                        showFakeData={false}
                      />
                    )}
                  </div>
                </div>
              )}

              {activeTab === "bookmarks" && (
                <BookmarksSection className="p-1 rounded-md mb-0" />
              )}
            </div>
          </div>
        </div>

        <SubmittedComplaintsSection />
      </div>
    </div>
  );
};
