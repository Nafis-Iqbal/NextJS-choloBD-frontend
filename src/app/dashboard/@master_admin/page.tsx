"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AuthApi } from "@/services/api";
import { useRouter } from "next/navigation";

import DivGap, { HorizontalDivider } from "@/components/custom-elements/UIUtilities";
import { UserManagerModule } from "@/components/modular-components/dashboard/master-admin/UserManagerModule";
import { WalletManagerModule } from "@/components/modular-components/dashboard/master-admin/WalletManagerModule";
import { ComplaintManagerModule } from "@/components/modular-components/dashboard/master-admin/ComplaintManagerModule";
import { SiteConfigManagerModule } from "@/components/modular-components/dashboard/master-admin/SiteConfigManagerModule";
import { LocationManagerModule } from "@/components/modular-components/dashboard/master-admin/LocationManagerModule";
import CategoryManagerModule from "@/components/modular-components/dashboard/master-admin/CategoryManagerModule";
import { ComplaintAddressedTo } from "@/types/enums";

type ManagementTabId = "locations" | "categories" | "users" | "complaints";

interface DashboardTab {
    id: ManagementTabId;
    label: string;
    description: string;
    /** Matches sidebar /dashboard#... hashes and module root ids */
    hash: string;
}

const MANAGEMENT_TABS: DashboardTab[] = [
    {
        id: "locations",
        label: "Locations",
        description: "Create and manage platform locations",
        hash: "locations_management",
    },
    {
        id: "categories",
        label: "Categories",
        description: "Manage amenity, policy, and content categories",
        hash: "category_management",
    },
    {
        id: "users",
        label: "Users",
        description: "View and manage platform users",
        hash: "users_management",
    },
    {
        id: "complaints",
        label: "User Complaints",
        description: "Review and resolve consumer complaints, about hotels, activity-spots, & guides.",
        hash: "complain_management",
    },
];

const HASH_TO_TAB: Record<string, ManagementTabId> = Object.fromEntries(
    MANAGEMENT_TABS.map((tab) => [tab.hash, tab.id])
) as Record<string, ManagementTabId>;

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

function TabSwitchContainer({
    title,
    tabs,
    activeTab,
    onTabChange,
    children,
}: {
    title: string;
    tabs: DashboardTab[];
    activeTab: ManagementTabId;
    onTabChange: (tabId: ManagementTabId) => void;
    children: React.ReactNode;
}) {
    const currentTab = tabs.find((tab) => tab.id === activeTab) || tabs[0];

    return (
        <div className="w-full theme-text mt-8 mb-4" id="management_tabs">
            <h3 className="theme-text-teal font-semibold mr-5 mb-4">{title}</h3>

            <div className="rounded-xl theme-outline bg-section overflow-hidden">
                <div
                    className="flex flex-wrap md:flex-nowrap gap-1 p-2 md:p-3 border-b"
                    style={{
                        borderColor: "var(--theme-deep-green)",
                        backgroundColor:
                            "var(--theme-sub-section-bg, var(--theme-card-bg))",
                    }}
                    role="tablist"
                    aria-label={title}
                >
                    {tabs.map((tab) => {
                        const isSelected = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={isSelected}
                                onClick={() => onTabChange(tab.id)}
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
                        className="mb-2 pb-2"
                        style={{ borderColor: "var(--theme-deep-green)" }}
                    >
                        <h2 className="text-2xl font-bold theme-text-teal">
                            {currentTab.label}
                        </h2>
                        <p className="theme-text-muted text-sm mt-1">
                            {currentTab.description}
                        </p>
                    </div>

                    <div className="space-y-2">{children}</div>
                </div>
            </div>
        </div>
    );
}

export default function MasterAdminDashboard() {
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;

    const router = useRouter();

    const [managementTab, setManagementTab] =
        useState<ManagementTabId>("locations");
    const pendingMenuScrollHashRef = useRef<string | null>(null);

    const applyHashFromUrl = useCallback((options?: { scroll?: boolean }) => {
        const hash = getLocationHash();
        if (!hash || !HASH_TO_TAB[hash]) return;

        setManagementTab(HASH_TO_TAB[hash]);

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

    const handleTabChange = useCallback((tabId: ManagementTabId) => {
        pendingMenuScrollHashRef.current = null;
        preserveViewportScroll();
        setManagementTab(tabId);
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
    }, [managementTab]);

    if (!isAuthenticated || currentUserRole !== "MASTER_ADMIN") {
        return <></>;
    }

    return (
        <section
            className="flex flex-col p-2 font-sans"
            id="dashboard_master_admin"
        >
            <div className="md:ml-6 flex flex-col space-y-2">
                <h2 className="theme-text-teal">Master Admin Panel</h2>
                <p className="theme-text-subtle">Site management functions here.</p>

                <div className="flex flex-col space-y-6 my-10" id="entity_management">
                    <h3 className="theme-text-teal font-semibold mr-5 text-lg md:text-xl">
                        Manage Site Content
                    </h3>

                    <div className="flex flex-col w-full md:w-[40%] space-y-3">
                        <div className="flex justify-between mx-2 gap-2">
                            <button
                                className="green-underline-button text-lg md:text-xl"
                                onClick={() => router.push("/hotels")}
                            >
                                View Hotel List
                            </button>
                            <button
                                className="green-button text-sm md:text-base shrink-0"
                                onClick={() => router.push("/hotels/create")}
                            >
                                Add new Hotel
                            </button>
                        </div>

                        <div className="flex justify-between mx-2 gap-2">
                            <button
                                className="green-underline-button text-lg md:text-xl"
                                onClick={() => router.push("/guides")}
                            >
                                View Guide List
                            </button>
                            <button
                                className="green-button text-sm md:text-base shrink-0"
                                onClick={() => router.push("/guides/create")}
                            >
                                Add new Guide
                            </button>
                        </div>

                        <div className="flex justify-between mx-2 gap-2">
                            <button
                                className="green-underline-button text-lg md:text-xl"
                                onClick={() => router.push("/tour-spots")}
                            >
                                View Tour Spot List
                            </button>
                            <button
                                className="green-button text-sm md:text-base shrink-0"
                                onClick={() => router.push("/tour-spots/create")}
                            >
                                Add new Tour Spot
                            </button>
                        </div>

                        <ul className="flex justify-between mx-2 gap-2">
                            <button
                                className="green-underline-button text-lg md:text-xl"
                                onClick={() => router.push("/activity-spots")}
                            >
                                View Activity Spot List
                            </button>
                            <button
                                className="green-button text-sm md:text-base shrink-0"
                                onClick={() => router.push("/activity-spots/create")}
                            >
                                Add new Activity Spot
                            </button>
                        </ul>

                        <div className="flex justify-between mx-2 gap-2">
                            <button
                                className="green-underline-button text-lg md:text-xl"
                                onClick={() => router.push("/transports")}
                            >
                                View Transport Services List
                            </button>
                            <button
                                className="green-button text-sm md:text-base shrink-0"
                                onClick={() => router.push("/transports/create")}
                            >
                                Add new Transport Service
                            </button>
                        </div>

                        <DivGap />

                        <ul className="flex justify-between mx-2 gap-2">
                            <button
                                className="green-underline-button text-lg md:text-xl"
                                onClick={() => router.push("/tour-builder/platform/tours")}
                            >
                                View Tour Plan Templates List
                            </button>
                            <button
                                className="green-button text-sm md:text-base shrink-0"
                                onClick={() => router.push("/tour-builder/platform")}
                            >
                                Add new Tour Plan Template
                            </button>
                        </ul>
                    </div>
                </div>

                <HorizontalDivider className="mr-5 my-10" />

                <TabSwitchContainer
                    title="Management Tabs"
                    tabs={MANAGEMENT_TABS}
                    activeTab={managementTab}
                    onTabChange={handleTabChange}
                >
                    {managementTab === "locations" && (
                        <LocationManagerModule className="scroll-mt-40" />
                    )}
                    {managementTab === "categories" && (
                        <CategoryManagerModule className="scroll-mt-40" />
                    )}
                    {managementTab === "users" && (
                        <UserManagerModule className="scroll-mt-40" />
                    )}
                    {managementTab === "complaints" && (
                        <ComplaintManagerModule
                            addressedTo={ComplaintAddressedTo.MASTER_ADMIN}
                            className="scroll-mt-40"
                        />
                    )}
                </TabSwitchContainer>

                <HorizontalDivider className="mr-5 my-10" />
                
                <WalletManagerModule />

                <HorizontalDivider className="mr-5 my-10" />

                <SiteConfigManagerModule />
            </div>

            <HorizontalDivider className="mt-15 md:mt-20" />
        </section>
    );
}
