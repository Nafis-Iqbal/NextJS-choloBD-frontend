"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AuthApi, UserApi } from "@/services/api";
import { PlaceholderFeatureWarning } from "@/components/placeholder-components/FeatureUnderDevelopment";
import { BusMetricsDashboard } from "./bus/BusMetricsDashboard";
import { BusSeatPlanSection } from "./bus/BusSeatPlanSection";
import { BusRideOperationsSection } from "./bus/BusRideOperationsSection";
import { BusTicketCheckinSection } from "./bus/BusTicketCheckinSection";
import { BusMaintenanceTasksSection } from "./bus/BusMaintenanceTasksSection";
import type { CoachType } from "./bus/types";
import {
  FAKE_BOARDING_TICKETS,
  FAKE_BUS_EMPLOYEE_METRICS,
  FAKE_BUS_MAINTENANCE_TASKS,
  FAKE_EMPLOYEE_RIDES,
} from "./bus/types";

export type BusEmployeeTabId = "seats" | "rides" | "checkin" | "maintenance";

interface EmployeeTab {
  id: BusEmployeeTabId;
  label: string;
  description: string;
  /** Matches sidebar /dashboard#... hashes and section root ids */
  hash: string;
}

export const BUS_EMPLOYEE_TABS: EmployeeTab[] = [
  {
    id: "seats",
    label: "Seat Plan",
    description: "View coach seat maps and booked vs open seats by bus type",
    hash: "bus_employee_seat_plan",
  },
  {
    id: "rides",
    label: "Ride Operations",
    description: "Track today's departures, boarding progress, and gates",
    hash: "bus_employee_rides",
  },
  {
    id: "checkin",
    label: "Ticket Check-in",
    description: "Verify passengers and mark boarding or no-show at the gate",
    hash: "bus_employee_checkin",
  },
  {
    id: "maintenance",
    label: "Maintenance",
    description: "Manage bus yard repairs and blocked-seat work orders",
    hash: "bus_employee_maintenance",
  },
];

const HASH_TO_TAB: Record<string, BusEmployeeTabId> = Object.fromEntries(
  BUS_EMPLOYEE_TABS.map((tab) => [tab.hash, tab.id])
) as Record<string, BusEmployeeTabId>;

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

export const BusServiceEmployeeModule = () => {
  const [activeTab, setActiveTab] = useState<BusEmployeeTabId>("seats");
  const [seatPlanCoachType, setSeatPlanCoachType] = useState<CoachType>("AC");
  const pendingMenuScrollHashRef = useRef<string | null>(null);

  const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
  const userId = authResponse?.data?.userId;

  const { data: userDetailData } = UserApi.useGetOwnUserDetailRQ(
    userId || "",
    !!userId
  );

  const currentTab =
    BUS_EMPLOYEE_TABS.find((tab) => tab.id === activeTab) ||
    BUS_EMPLOYEE_TABS[0];

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

  const handleTabChange = useCallback((tabId: BusEmployeeTabId) => {
    pendingMenuScrollHashRef.current = null;
    preserveViewportScroll();
    setActiveTab(tabId);
  }, []);

  const handleViewSeatPlan = useCallback(
    (coachType: CoachType) => {
      setSeatPlanCoachType(coachType);
      handleTabChange("seats");
    },
    [handleTabChange]
  );

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
  }, [activeTab]);

  return (
    <section
      className="flex flex-col space-y-2 mt-4 w-full theme-text min-h-screen md:p-6 rounded-lg"
      id="bus_service_employee_module"
    >
      <div className="max-w-7xl w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold theme-text">
            Bus Maintenance Dashboard
          </h1>
          <p className="theme-text-subtle mt-2">
            Seat plans, boarding check-in, ride operations, and yard maintenance
          </p>

          {userDetailData?.data?.employeeServiceEntityName && (
            <h2 className="text-2xl md:text-3xl font-bold theme-text-teal mt-4 md:mt-8">
              {userDetailData.data.employeeServiceEntityName}
            </h2>
          )}
        </div>

        <PlaceholderFeatureWarning moduleName="Bus Maintenance Dashboard" />

        <BusMetricsDashboard
          metrics={FAKE_BUS_EMPLOYEE_METRICS}
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
            aria-label="Bus employee sections"
          >
            {BUS_EMPLOYEE_TABS.map((tab) => {
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
              {activeTab === "seats" && (
                <BusSeatPlanSection
                  key={seatPlanCoachType}
                  initialCoachType={seatPlanCoachType}
                  id="bus_employee_seat_plan"
                  className="scroll-mt-24 p-1 rounded-md mb-0"
                />
              )}

              {activeTab === "rides" && (
                <BusRideOperationsSection
                  rides={FAKE_EMPLOYEE_RIDES}
                  id="bus_employee_rides"
                  className="scroll-mt-24 p-1 rounded-md mb-0"
                  onViewSeatPlan={handleViewSeatPlan}
                />
              )}

              {activeTab === "checkin" && (
                <BusTicketCheckinSection
                  tickets={FAKE_BOARDING_TICKETS}
                  id="bus_employee_checkin"
                  className="scroll-mt-24 p-1 rounded-md mb-0"
                />
              )}

              {activeTab === "maintenance" && (
                <BusMaintenanceTasksSection
                  tasks={FAKE_BUS_MAINTENANCE_TASKS}
                  id="bus_employee_maintenance"
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
