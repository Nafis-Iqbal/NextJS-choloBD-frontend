"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { GuideApi, GuideBookingApi } from "@/services/api";
import { GuideProfileSection } from "./guide/GuideProfileSection";
import { GuideStatsDashboard } from "./guide/GuideStatsDashboard";
import { BookingRequestManagement } from "./guide/BookingRequestManagement";
import { EarningsSummarySection } from "./guide/EarningsSummarySection";

export type GuideAdminTabId = "profile" | "bookings" | "earnings";

interface AdminTab {
  id: GuideAdminTabId;
  label: string;
  description: string;
  /** Matches sidebar /dashboard#... hashes and section root ids */
  hash: string;
}

export const GUIDE_ADMIN_TABS: AdminTab[] = [
  {
    id: "profile",
    label: "Guide Profile",
    description: "View and manage your guide profile details",
    hash: "guide_admin_profile",
  },
  {
    id: "bookings",
    label: "Booking Requests",
    description: "Accept, decline, and complete guest booking requests",
    hash: "guide_admin_bookings",
  },
  {
    id: "earnings",
    label: "Earnings",
    description: "Booking earnings, pending amounts, and payment summary",
    hash: "guide_admin_earnings",
  },
];

const HASH_TO_TAB: Record<string, GuideAdminTabId> = Object.fromEntries(
  GUIDE_ADMIN_TABS.map((tab) => [tab.hash, tab.id])
) as Record<string, GuideAdminTabId>;

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

export const GuideServiceAdminModule = () => {
  const [activeTab, setActiveTab] = useState<GuideAdminTabId>("profile");
  const pendingMenuScrollHashRef = useRef<string | null>(null);

  const { data: guideResponse, isLoading: isGuideLoading } =
    GuideApi.useGetMyGuideRQ(true);
  const guideProfile = guideResponse?.data;

  const { data: bookingsResponse } = GuideBookingApi.useGetGuideBookingsRQ(
    guideProfile?.id ? `guideId=${guideProfile.id}` : undefined
  );

  const currentTab =
    GUIDE_ADMIN_TABS.find((tab) => tab.id === activeTab) || GUIDE_ADMIN_TABS[0];

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

  const handleTabChange = useCallback((tabId: GuideAdminTabId) => {
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
    if (!hash || !guideProfile) return;

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
  }, [activeTab, guideProfile]);

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

  const guideName = `${guideProfile.firstName} ${guideProfile.lastName}`.trim();

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
          {guideName && (
            <h2 className="text-2xl md:text-3xl font-bold theme-text-teal mt-3">
              {guideName}
            </h2>
          )}
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
            {GUIDE_ADMIN_TABS.map((tab) => {
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
                <GuideProfileSection
                  profile={guideProfile}
                  id="guide_admin_profile"
                  className="scroll-mt-24 p-1 rounded-md mb-0"
                />
              )}

              {activeTab === "bookings" && (
                <BookingRequestManagement
                  guideId={guideProfile.id}
                  id="guide_admin_bookings"
                  className="scroll-mt-24 p-1 rounded-md mb-0"
                />
              )}

              {activeTab === "earnings" && (
                <EarningsSummarySection
                  guideId={guideProfile.id}
                  id="guide_admin_earnings"
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
