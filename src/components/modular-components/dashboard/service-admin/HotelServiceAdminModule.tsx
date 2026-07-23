"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { HotelApi, UserApi, AuthApi } from "@/services/api";
import { RoomTypeManagementSection } from "./hotel/HotelRoomTypeManagementModule";
import { ComplaintManagerModule } from "../master-admin/ComplaintManagerModule";
import { RoomTypeStatsSection } from "./hotel/RoomTypeStatsSection";
import { HotelProfileSection } from "./hotel/HotelProfileSection";
import { AdminStatsDashboard } from "./hotel/AdminStatsDashboard";
import { EarningsSummarySection } from "./hotel/EarningsSummarySection";
import { ComplaintAddressedTo, ComplaintTargetType } from "@/types/enums";

export type HotelAdminTabId = "profile" | "rooms" | "earnings" | "complaints";

interface AdminTab {
  id: HotelAdminTabId;
  label: string;
  description: string;
  /** Matches sidebar /dashboard#... hashes and section root ids */
  hash: string;
}

export const HOTEL_ADMIN_TABS: AdminTab[] = [
  {
    id: "profile",
    label: "Hotel Profile",
    description: "View and manage your hotel profile details",
    hash: "hotel_admin_profile",
  },
  {
    id: "rooms",
    label: "Room Management",
    description: "Room type statistics and room inventory management",
    hash: "hotel_admin_rooms",
  },
  {
    id: "earnings",
    label: "Earnings",
    description: "Booking earnings, pending amounts, and payment summary",
    hash: "hotel_admin_earnings",
  },
  {
    id: "complaints",
    label: "Customer Complaints",
    description: "Track and resolve guest complaints",
    hash: "hotel_admin_complaints",
  },
];

const HASH_TO_TAB: Record<string, HotelAdminTabId> = Object.fromEntries(
  HOTEL_ADMIN_TABS.map((tab) => [tab.hash, tab.id])
) as Record<string, HotelAdminTabId>;

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

export const HotelServiceAdminModule = () => {
  const [activeTab, setActiveTab] = useState<HotelAdminTabId>("profile");
  const [openCreateRoomTypeModal, setOpenCreateRoomTypeModal] = useState(false);
  const pendingMenuScrollHashRef = useRef<string | null>(null);

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
    HOTEL_ADMIN_TABS.find((tab) => tab.id === activeTab) || HOTEL_ADMIN_TABS[0];

  const clearCreateRoomTypeQuery = useCallback(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("createRoomType") !== "1") return;

    const hash = window.location.hash || "#hotel_admin_rooms";
    window.history.replaceState(null, "", `/dashboard${hash}`);
  }, []);

  const applyHashFromUrl = useCallback((options?: { scroll?: boolean }) => {
    const hash = getLocationHash();
    const params = new URLSearchParams(window.location.search);
    const wantsCreateRoomType = params.get("createRoomType") === "1";

    if (wantsCreateRoomType) {
      setActiveTab("rooms");
      setOpenCreateRoomTypeModal(true);
      if (options?.scroll) {
        const target = hash || "hotel_admin_rooms";
        pendingMenuScrollHashRef.current = target;
        window.setTimeout(() => {
          if (
            pendingMenuScrollHashRef.current === target &&
            scrollToHashTarget(target)
          ) {
            pendingMenuScrollHashRef.current = null;
          }
        }, 0);
      }
      return;
    }

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

  const handleTabChange = useCallback((tabId: HotelAdminTabId) => {
    pendingMenuScrollHashRef.current = null;
    preserveViewportScroll();
    setActiveTab(tabId);
  }, []);

  const handleCreateRoomTypeModalClose = useCallback(() => {
    setOpenCreateRoomTypeModal(false);
    clearCreateRoomTypeQuery();
  }, [clearCreateRoomTypeQuery]);

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
      const urlStr = typeof url === "string" ? url : url?.toString?.() ?? "";
      const hash = hashFromHistoryUrl(url);
      const wantsCreate =
        urlStr.includes("createRoomType=1") ||
        new URLSearchParams(window.location.search).get("createRoomType") ===
          "1";
      if ((!hash || !HASH_TO_TAB[hash]) && !wantsCreate) return;
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
    if (!hash || !hotelProfile) return;

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
  }, [activeTab, hotelProfile]);

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
            {HOTEL_ADMIN_TABS.map((tab) => {
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
              {activeTab === "profile" && (
                <HotelProfileSection
                  profile={hotelProfile}
                  id="hotel_admin_profile"
                  className="scroll-mt-24 p-1 rounded-md mb-0"
                />
              )}

              {activeTab === "rooms" && (
                <>
                  <RoomTypeStatsSection
                    roomTypes={hotelProfile.roomTypes || []}
                    id="hotel_admin_rooms"
                    className="scroll-mt-24 p-1 rounded-md mb-0"
                  />
                  <RoomTypeManagementSection
                    hotelId={hotelProfile.id}
                    hotelDetail={hotelProfile}
                    className="p-1 rounded-md mb-0"
                    openCreateModal={openCreateRoomTypeModal}
                    onCreateModalClose={handleCreateRoomTypeModalClose}
                  />
                </>
              )}

              {activeTab === "earnings" && (
                <EarningsSummarySection
                  hotelId={hotelProfile.id}
                  id="hotel_admin_earnings"
                  className="scroll-mt-24 p-1 rounded-md mb-0"
                />
              )}

              {activeTab === "complaints" && (
                <ComplaintManagerModule
                  addressedTo={ComplaintAddressedTo.SERVICE_ADMIN}
                  targetType={ComplaintTargetType.HOTEL}
                  targetEntityId={hotelProfile.id}
                  sectionId="hotel_admin_complaints"
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
