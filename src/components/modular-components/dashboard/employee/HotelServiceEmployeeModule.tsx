"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HotelMetricsDashboard } from "./hotel/HotelMetricsDashboard";
import { HotelRoomStatusManagement } from "./hotel/HotelRoomStatusManagement";
import { HotelRoomBookingsManagement } from "./hotel/HotelRoomBookingsManagement";
import { HotelMaintenanceTasksManagement } from "./hotel/HotelMaintenanceTasksManagement";
import { ComplaintManagerModule } from "../master-admin/ComplaintManagerModule";
import { AuthApi, HotelRoomApi, HotelBookingApi, UserApi } from "@/services/api";
import { ComplaintAddressedTo, ComplaintTargetType } from "@/types/enums";
import { FAKE_METRICS, FAKE_MAINTENANCE_TASKS } from "./hotel/fakeData";

export type HotelEmployeeTabId = "rooms" | "bookings" | "complaints" | "maintenance";

interface EmployeeTab {
  id: HotelEmployeeTabId;
  label: string;
  description: string;
  /** Matches sidebar /dashboard#... hashes and section root ids */
  hash: string;
}

export const HOTEL_EMPLOYEE_TABS: EmployeeTab[] = [
  {
    id: "rooms",
    label: "Room Management",
    description: "View and update room status and availability",
    hash: "hotel_room_status_management",
  },
  {
    id: "bookings",
    label: "Bookings",
    description: "Manage hotel room bookings and check-ins",
    hash: "hotel_room_bookings_management",
  },
  {
    id: "complaints",
    label: "Customer Complaints",
    description: "Track and resolve guest complaints",
    hash: "hotel_employee_complaints",
  },
  {
    id: "maintenance",
    label: "Maintenance Tasks",
    description: "Assign and complete hotel maintenance tasks",
    hash: "hotel_maintenance_tasks_management",
  },
];

const HASH_TO_TAB: Record<string, HotelEmployeeTabId> = Object.fromEntries(
  HOTEL_EMPLOYEE_TABS.map((tab) => [tab.hash, tab.id])
) as Record<string, HotelEmployeeTabId>;

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

function preserveViewportScroll() {
  const y = window.scrollY;
  const restore = () => window.scrollTo(0, y);
  restore();
  requestAnimationFrame(restore);
  window.setTimeout(restore, 0);
  window.setTimeout(restore, 50);
}

export const HotelServiceEmployeeModule = () => {
  const [activeTab, setActiveTab] = useState<HotelEmployeeTabId>("rooms");
  const pendingMenuScrollHashRef = useRef<string | null>(null);

  const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
  const userId = authResponse?.data?.userId;

  const { data: userDetailData } = UserApi.useGetOwnUserDetailRQ(
    userId || "",
    !!userId
  );
  const hotelId = userDetailData?.data?.employeeServiceEntityId;

  const { data: roomsResponse } = HotelRoomApi.useGetHotelRoomsRQ(
    hotelId || ""
  );

  const { data: bookingsResponse } = HotelBookingApi.useGetBookingsRQ(
    hotelId ? `hotelId=${hotelId}` : undefined
  );

  const hotelRooms = useMemo(() => {
    return roomsResponse?.data || [];
  }, [roomsResponse?.data]);

  const hotelBookings = useMemo(() => {
    const data = bookingsResponse?.data;
    if (Array.isArray(data)) {
      return data;
    }
    return (data as { data?: HotelRoomBooking[] })?.data || [];
  }, [bookingsResponse?.data]);

  const currentTab =
    HOTEL_EMPLOYEE_TABS.find((tab) => tab.id === activeTab) ||
    HOTEL_EMPLOYEE_TABS[0];

  const applyHashFromUrl = useCallback((options?: { scroll?: boolean }) => {
    const hash = getLocationHash();
    if (!hash || !HASH_TO_TAB[hash]) return;

    setActiveTab(HASH_TO_TAB[hash]);

    if (options?.scroll) {
      pendingMenuScrollHashRef.current = hash;
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

  const handleTabChange = useCallback((tabId: HotelEmployeeTabId) => {
    pendingMenuScrollHashRef.current = null;
    preserveViewportScroll();
    setActiveTab(tabId);
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
      if (!hash || !HASH_TO_TAB[hash]) return;
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
  }, [activeTab, hotelId, hotelRooms, hotelBookings]);

  return (
    <section
      className="flex flex-col space-y-2 mt-4 w-full bg-inherit theme-text min-h-screen md:p-6 rounded-lg"
      id="hotel_service_employee_module"
    >
      <div className="max-w-7xl w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold theme-text">
            Hotel Management Dashboard
          </h1>
          <p className="theme-text-subtle mt-2">
            Manage rooms, bookings, complaints, and maintenance tasks
          </p>

          <h2 className="text-2xl md:text-3xl font-bold theme-text-teal mt-4 md:mt-8">
            {userDetailData?.data?.employeeServiceEntityName}
          </h2>
        </div>

        <HotelMetricsDashboard
          metrics={FAKE_METRICS}
          isReady={false}
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
            aria-label="Hotel employee sections"
          >
            {HOTEL_EMPLOYEE_TABS.map((tab) => {
              const isSelected = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleTabChange(tab.id)}
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
              {activeTab === "rooms" && (
                <HotelRoomStatusManagement
                  rooms={hotelRooms}
                  className="scroll-mt-24 p-1 rounded-md mb-0"
                />
              )}

              {activeTab === "bookings" && (
                <HotelRoomBookingsManagement
                  bookings={hotelBookings}
                  className="scroll-mt-24 p-1 rounded-md mb-0"
                />
              )}

              {activeTab === "complaints" && hotelId && (
                <ComplaintManagerModule
                  addressedTo={ComplaintAddressedTo.SERVICE_ADMIN}
                  targetType={ComplaintTargetType.HOTEL}
                  targetEntityId={hotelId}
                  sectionId="hotel_employee_complaints"
                  className="scroll-mt-24 p-1 rounded-md mb-0"
                />
              )}

              {activeTab === "maintenance" && (
                <HotelMaintenanceTasksManagement
                  tasks={FAKE_MAINTENANCE_TASKS}
                  className="scroll-mt-24 p-1 rounded-md mb-0"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
