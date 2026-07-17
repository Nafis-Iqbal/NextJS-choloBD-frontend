"use client";

import React, { useState } from "react";
import { ActivitySpotApi, ActivitySpotBookingApi, AuthApi, UserApi } from "@/services/api";
import { ActivityProfileSection } from "./activity/ActivityProfileSection";
import { ActivityStatsDashboard } from "./activity/ActivityStatsDashboard";
import { BookingRequestManagement } from "./activity/BookingRequestManagement";
import { EarningsSummarySection } from "./activity/EarningsSummarySection";

type AdminTabId = "profile" | "bookings" | "earnings";

interface AdminTab {
  id: AdminTabId;
  label: string;
  description: string;
}

const ADMIN_TABS: AdminTab[] = [
  {
    id: "profile",
    label: "Activity Profile",
    description: "View and manage your activity spot details",
  },
  {
    id: "bookings",
    label: "Bookings",
    description: "View bookings and cancel pending or confirmed requests",
  },
  {
    id: "earnings",
    label: "Earnings",
    description: "Booking earnings, pending amounts, and payment summary",
  },
];

export const ActivityServiceAdminModule = () => {
  const [activeTab, setActiveTab] = useState<AdminTabId>("profile");

  const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
  const userId = authResponse?.data?.userId;

  const { data: userDetailData, isLoading: isUserLoading } =
    UserApi.useGetOwnUserDetailRQ(userId || "", !!userId);
  const activitySpotId = userDetailData?.data?.serviceEntityId;

  const { data: activitySpotData, isLoading: isActivityLoading } =
    ActivitySpotApi.useGetActivitySpotDetailRQ(activitySpotId || "");

  const activityProfile = activitySpotData?.data;

  const { data: bookingsResponse } =
    ActivitySpotBookingApi.useGetActivityBookingsRQ(
      activityProfile?.id ? { activitySpotId: activityProfile.id } : undefined
    );

  const currentTab =
    ADMIN_TABS.find((tab) => tab.id === activeTab) || ADMIN_TABS[0];

  const isLoading = isUserLoading || isActivityLoading;

  if (isLoading || !activityProfile) {
    return (
      <section className="flex flex-col space-y-2 mt-4 w-full bg-inherit theme-text min-h-screen p-6">
        <div className="max-w-7xl mx-auto w-full">
          <h1 className="text-4xl font-bold theme-text">
            Activity Admin Dashboard
          </h1>
          <p className="theme-text-subtle mt-2">
            {isLoading
              ? "Loading activity data..."
              : "No activity spot found for this account."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="flex flex-col space-y-2 mt-4 w-full bg-inherit theme-text min-h-screen md:p-6 rounded-lg"
      id="activity_service_admin_module"
    >
      <div className="max-w-7xl w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold theme-text">
            Activity Admin Dashboard
          </h1>
          <p className="theme-text-subtle mt-2">
            Manage activity profile, bookings, and earnings
          </p>
        </div>

        <ActivityStatsDashboard
          activitySpot={activityProfile}
          bookings={bookingsResponse?.data ?? undefined}
          className="rounded-md mb-8"
        />

        <div className="rounded-xl theme-outline bg-section overflow-hidden min-h-screen">
          <div
            className="flex flex-wrap md:flex-nowrap gap-1 p-2 md:p-3 border-b"
            style={{
              borderColor: "var(--theme-deep-green)",
              backgroundColor:
                "var(--theme-sub-section-bg, var(--theme-card-bg))",
            }}
            role="tablist"
            aria-label="Activity admin sections"
          >
            {ADMIN_TABS.map((tab) => {
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
              <h2 className="text-2xl font-bold theme-text-teal">
                {currentTab.label}
              </h2>
              <p className="theme-text-muted text-sm mt-1">
                {currentTab.description}
              </p>
            </div>

            <div className="space-y-2">
              {activeTab === "profile" && (
                <ActivityProfileSection
                  profile={activityProfile}
                  className="p-1 rounded-md mb-0"
                />
              )}

              {activeTab === "bookings" && (
                <BookingRequestManagement
                  activitySpotId={activityProfile.id}
                  className="p-1 rounded-md mb-0"
                />
              )}

              {activeTab === "earnings" && (
                <EarningsSummarySection
                  activitySpotId={activityProfile.id}
                  className="p-1 rounded-md mb-0"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
