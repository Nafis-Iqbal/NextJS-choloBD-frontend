"use client";

import React, { useState } from "react";
import { HotelApi, UserApi, AuthApi } from "@/services/api";
import { RoomTypeManagementSection } from "./hotel/HotelRoomTypeManagementModule";
import { ComplaintManagerModule } from "../master-admin/ComplaintManagerModule";
import { RoomTypeStatsSection } from "./hotel/RoomTypeStatsSection";
import { HotelProfileSection } from "./hotel/HotelProfileSection";
import { AdminStatsDashboard } from "./hotel/AdminStatsDashboard";
import { EarningsSummarySection } from "./hotel/EarningsSummarySection";
import { ComplaintAddressedTo, ComplaintTargetType } from "@/types/enums";

type AdminTabId = "profile" | "rooms" | "earnings" | "complaints";

interface AdminTab {
  id: AdminTabId;
  label: string;
  description: string;
}

const ADMIN_TABS: AdminTab[] = [
  {
    id: "profile",
    label: "Hotel Profile",
    description: "View and manage your hotel profile details",
  },
  {
    id: "rooms",
    label: "Room Management",
    description: "Room type statistics and room inventory management",
  },
  {
    id: "earnings",
    label: "Earnings",
    description: "Booking earnings, pending amounts, and payment summary",
  },
  {
    id: "complaints",
    label: "Customer Complaints",
    description: "Track and resolve guest complaints",
  },
];

export const HotelServiceAdminModule = () => {
  const [activeTab, setActiveTab] = useState<AdminTabId>("profile");

  const { data: authResponse, isLoading: isAuthLoading } =
    AuthApi.useGetUserAuthenticationRQ(true);
  const userId = authResponse?.data?.userId;

  const {
    data: userDetailResponse,
    isLoading: isUserLoading,
    isFetched: isUserFetched,
  } = UserApi.useGetOwnUserDetailRQ(userId || "", !!userId);

  const userDetail = userDetailResponse?.data;
  const hotelId = userDetail?.serviceEntityId || "";

  const {
    data: hotelResponse,
    isLoading: isHotelLoading,
    isFetched: isHotelFetched,
  } = HotelApi.useGetHotelDetailRQ(hotelId);

  const hotelProfile = hotelResponse?.data;
  const currentTab =
    ADMIN_TABS.find((tab) => tab.id === activeTab) || ADMIN_TABS[0];

  const isBootstrapping =
    isAuthLoading ||
    !userId ||
    isUserLoading ||
    (Boolean(hotelId) && isHotelLoading);

  if (isBootstrapping) {
    return (
      <section className="flex flex-col space-y-2 mt-4 w-full bg-inherit theme-text min-h-screen p-6">
        <div className="max-w-7xl mx-auto w-full">
          <h1 className="text-4xl font-bold theme-text">Hotel Admin Dashboard</h1>
          <p className="theme-text-subtle mt-2">Loading hotel data...</p>
        </div>
      </section>
    );
  }

  if (isUserFetched && !hotelId) {
    return (
      <section className="flex flex-col space-y-2 mt-4 w-full bg-inherit theme-text min-h-screen p-6">
        <div className="max-w-7xl mx-auto w-full">
          <h1 className="text-4xl font-bold theme-text">Hotel Admin Dashboard</h1>
          <p className="theme-text-subtle mt-2">
            No hotel is assigned to this service admin account yet.
          </p>
        </div>
      </section>
    );
  }

  if (isHotelFetched && !hotelProfile) {
    return (
      <section className="flex flex-col space-y-2 mt-4 w-full bg-inherit theme-text min-h-screen p-6">
        <div className="max-w-7xl mx-auto w-full">
          <h1 className="text-4xl font-bold theme-text">Hotel Admin Dashboard</h1>
          <p className="theme-text-subtle mt-2">
            Could not load hotel details
            {userDetail?.serviceEntityName
              ? ` for ${userDetail.serviceEntityName}`
              : ""}
            .
          </p>
        </div>
      </section>
    );
  }

  if (!hotelProfile) {
    return null;
  }

  return (
    <section
      className="flex flex-col space-y-2 mt-4 w-full bg-inherit theme-text min-h-screen md:p-6 rounded-lg"
      id="hotel_service_admin_module"
    >
      <div className="max-w-7xl w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold theme-text">Hotel Admin Dashboard</h1>
          <p className="theme-text-subtle mt-2">
            Manage hotel profile, rooms, earnings, and customer complaints
          </p>
          {userDetail?.serviceEntityName && (
            <h2 className="text-2xl md:text-3xl font-bold theme-text-teal mt-3">
              {userDetail.serviceEntityName}
            </h2>
          )}
        </div>

        <AdminStatsDashboard isReady={false} className="rounded-md mb-8" />

        <div className="rounded-xl theme-outline bg-section overflow-hidden min-h-screen">
          <div
            className="flex flex-wrap md:flex-nowrap gap-1 p-2 md:p-3 border-b"
            style={{
              borderColor: "var(--theme-deep-green)",
              backgroundColor:
                "var(--theme-sub-section-bg, var(--theme-card-bg))",
            }}
            role="tablist"
            aria-label="Hotel admin sections"
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
                <HotelProfileSection
                  profile={hotelProfile}
                  className="p-1 rounded-md mb-0"
                />
              )}

              {activeTab === "rooms" && (
                <>
                  <RoomTypeStatsSection
                    roomTypes={hotelProfile.roomTypes || []}
                    className="p-1 rounded-md mb-0"
                  />
                  <RoomTypeManagementSection
                    hotelId={hotelProfile.id}
                    hotelDetail={hotelProfile}
                    className="p-1 rounded-md mb-0"
                  />
                </>
              )}

              {activeTab === "earnings" && (
                <EarningsSummarySection
                  hotelId={hotelProfile.id}
                  className="p-1 rounded-md mb-0"
                />
              )}

              {activeTab === "complaints" && (
                <ComplaintManagerModule
                  addressedTo={ComplaintAddressedTo.SERVICE_ADMIN}
                  targetType={ComplaintTargetType.HOTEL}
                  targetEntityId={hotelProfile.id}
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
