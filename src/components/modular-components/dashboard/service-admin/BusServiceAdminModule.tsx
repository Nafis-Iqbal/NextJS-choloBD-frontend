"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { PlaceholderFeatureWarning } from "@/components/placeholder-components/FeatureUnderDevelopment";
import { AdminStatsDashboard } from "./bus/AdminStatsDashboard";
import { BusManagementSection } from "./bus/BusManagementSection";
import { RideManagementSection } from "./bus/RideManagementSection";
import { SalesReportSection } from "./bus/SalesReportSection";
import { TabSwitchContainer } from "./bus/TabSwitchContainer";
import {
  FAKE_ADMIN_STATS,
  FAKE_BUSES,
  FAKE_RIDES,
  FAKE_SALES_REPORTS,
} from "./bus/types";

export type BusAdminTabId = "buses" | "rides" | "sales";

interface AdminTab {
  id: BusAdminTabId;
  label: string;
  description: string;
  /** Matches sidebar /dashboard#... hashes and section root ids */
  hash: string;
}

export const BUS_ADMIN_TABS: AdminTab[] = [
  {
    id: "buses",
    label: "Bus Management",
    description: "Add, activate, and manage your bus fleet inventory",
    hash: "bus_admin_buses",
  },
  {
    id: "rides",
    label: "Ride Management",
    description: "Create rides, track occupancy, and update ride status",
    hash: "bus_admin_rides",
  },
  {
    id: "sales",
    label: "Sales Report",
    description: "Review ticket sales, revenue, and occupancy trends",
    hash: "bus_admin_sales",
  },
];

const HASH_TO_TAB: Record<string, BusAdminTabId> = Object.fromEntries(
  BUS_ADMIN_TABS.map((tab) => [tab.hash, tab.id])
) as Record<string, BusAdminTabId>;

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

export const BusServiceAdminModule = () => {
  const [activeTab, setActiveTab] = useState<BusAdminTabId>("buses");
  const pendingMenuScrollHashRef = useRef<string | null>(null);

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

  const handleTabChange = useCallback((tabId: string) => {
    pendingMenuScrollHashRef.current = null;
    preserveViewportScroll();
    setActiveTab(tabId as BusAdminTabId);
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
  }, [activeTab]);

  return (
    <section
      className="flex flex-col space-y-2 mt-4 w-full bg-inherit theme-text min-h-screen md:p-6 rounded-lg"
      id="bus_service_admin_module"
    >
      <div className="max-w-7xl w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold theme-text">
            Bus Service Admin Dashboard
          </h1>
          <p className="theme-text-subtle mt-2">
            Manage buses, rides, and sales reports
          </p>
        </div>

        <PlaceholderFeatureWarning moduleName="Bus Service Admin Dashboard" />

        <AdminStatsDashboard
          stats={FAKE_ADMIN_STATS}
          className="rounded-md mb-8"
        />

        <TabSwitchContainer
          title="Bus admin sections"
          tabs={BUS_ADMIN_TABS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          className="max-h-[90vh]"
        >
          {activeTab === "buses" && (
            <BusManagementSection
              buses={FAKE_BUSES}
              id="bus_admin_buses"
              className="scroll-mt-24 p-1 rounded-md mb-0 max-h-[90vh] overflow-y-auto"
            />
          )}

          {activeTab === "rides" && (
            <RideManagementSection
              rides={FAKE_RIDES}
              id="bus_admin_rides"
              className="scroll-mt-24 p-1 rounded-md mb-0 max-h-[90vh] overflow-y-auto"
            />
          )}

          {activeTab === "sales" && (
            <SalesReportSection
              reports={FAKE_SALES_REPORTS}
              id="bus_admin_sales"
              className="scroll-mt-24 p-1 rounded-md mb-0 max-h-[90vh] overflow-y-auto"
            />
          )}
        </TabSwitchContainer>
      </div>
    </section>
  );
};
