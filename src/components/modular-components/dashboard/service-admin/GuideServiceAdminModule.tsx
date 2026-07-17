"use client";

import React, { useState } from "react";
import { GuideApi, GuideBookingApi } from "@/services/api";
import { GuideProfileSection } from "./guide/GuideProfileSection";
import { GuideStatsDashboard } from "./guide/GuideStatsDashboard";
import { BookingRequestManagement } from "./guide/BookingRequestManagement";
import { EarningsSummarySection } from "./guide/EarningsSummarySection";

type AdminTabId = "profile" | "bookings" | "earnings";

interface AdminTab {
  id: AdminTabId;
  label: string;
  description: string;
}

const ADMIN_TABS: AdminTab[] = [
  {
    id: "profile",
    label: "Guide Profile",
    description: "View and manage your guide profile details",
  },
  {
    id: "bookings",
    label: "Booking Requests",
    description: "Accept, decline, and complete guest booking requests",
  },
  {
    id: "earnings",
    label: "Earnings",
    description: "Booking earnings, pending amounts, and payment summary",
  },
];

export const GuideServiceAdminModule = () => {
  const [activeTab, setActiveTab] = useState<AdminTabId>("profile");

  const { data: guideResponse, isLoading: isGuideLoading } =
    GuideApi.useGetMyGuideRQ(true);
  const guideProfile = guideResponse?.data;

  const { data: bookingsResponse } = GuideBookingApi.useGetGuideBookingsRQ(
    guideProfile?.id ? `guideId=${guideProfile.id}` : undefined
  );

  const currentTab =
    ADMIN_TABS.find((tab) => tab.id === activeTab) || ADMIN_TABS[0];

  if (isGuideLoading || !guideProfile) {
    return (
      <section className="flex flex-col space-y-2 mt-4 w-full bg-inherit theme-text min-h-screen p-6">
        <div className="max-w-7xl mx-auto w-full">
          <h1 className="text-4xl font-bold theme-text">Guide Admin Dashboard</h1>
          <p className="theme-text-subtle mt-2">
            {isGuideLoading
              ? "Loading guide data..."
              : "No guide profile found for this account."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="flex flex-col space-y-2 mt-4 w-full bg-inherit theme-text min-h-screen md:p-6 rounded-lg"
      id="guide_service_admin_module"
    >
      <div className="max-w-7xl w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold theme-text">Guide Admin Dashboard</h1>
          <p className="theme-text-subtle mt-2">
            Manage guide profile, booking requests, and earnings
          </p>
        </div>

        <GuideStatsDashboard
          guide={guideProfile}
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
            aria-label="Guide admin sections"
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
                <GuideProfileSection
                  profile={guideProfile}
                  className="p-1 rounded-md mb-0"
                />
              )}

              {activeTab === "bookings" && (
                <BookingRequestManagement
                  guideId={guideProfile.id}
                  className="p-1 rounded-md mb-0"
                />
              )}

              {activeTab === "earnings" && (
                <EarningsSummarySection
                  guideId={guideProfile.id}
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
