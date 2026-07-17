"use client";

import { useState } from "react";
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
}

const MANAGEMENT_TABS: DashboardTab[] = [
    {
        id: "locations",
        label: "Locations",
        description: "Create and manage platform locations",
    },
    {
        id: "categories",
        label: "Categories",
        description: "Manage amenity, policy, and content categories",
    },
    {
        id: "users",
        label: "Users",
        description: "View and manage platform users",
    },
    {
        id: "complaints",
        label: "User Complaints",
        description: "Review and resolve consumer complaints, about hotels, activity-spots, & guides.",
    },
];

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
        <div className="w-full theme-text mt-8 mb-4">
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

                <div className="flex flex-col space-y-6 my-10" id="enity_management">
                    <h3 className="theme-text-teal font-semibold mr-5">
                        Manage Site Content
                    </h3>

                    <div className="flex flex-col w-full md:w-[40%] space-y-3">
                        <div className="flex justify-between mx-2">
                            <button
                                className="green-underline-button text-xl"
                                onClick={() => router.push("/hotels")}
                            >
                                View Hotel List
                            </button>
                            <button
                                className="green-button"
                                onClick={() => router.push("/hotels/create")}
                            >
                                Add new Hotel
                            </button>
                        </div>

                        <div className="flex justify-between mx-2">
                            <button
                                className="green-underline-button text-xl"
                                onClick={() => router.push("/tour-spots")}
                            >
                                View Tour Spot List
                            </button>
                            <button
                                className="green-button"
                                onClick={() => router.push("/tour-spots/create")}
                            >
                                Add new Tour Spot
                            </button>
                        </div>

                        <ul className="flex justify-between mx-2">
                            <button
                                className="green-underline-button text-xl"
                                onClick={() => router.push("/activity-spots")}
                            >
                                View Activity Spot List
                            </button>
                            <button
                                className="green-button"
                                onClick={() => router.push("/activity-spots/create")}
                            >
                                Add new Activity Spot
                            </button>
                        </ul>

                        <DivGap />

                        <ul className="flex justify-between mx-2">
                            <button
                                className="green-underline-button text-xl"
                                onClick={() => router.push("/tour-builder/tours")}
                            >
                                View Tour Plan Templates List
                            </button>
                            <button
                                className="green-button"
                                onClick={() => router.push("/tour-builder")}
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
                    onTabChange={setManagementTab}
                >
                    {managementTab === "locations" && <LocationManagerModule />}
                    {managementTab === "categories" && <CategoryManagerModule />}
                    {managementTab === "users" && <UserManagerModule />}
                    {managementTab === "complaints" && (
                        <ComplaintManagerModule
                            addressedTo={ComplaintAddressedTo.MASTER_ADMIN}
                        />
                    )}
                </TabSwitchContainer>

                <HorizontalDivider className="mr-5 my-10" />

                <SiteConfigManagerModule />

                <HorizontalDivider className="mr-5 my-10" />

                <WalletManagerModule />
            </div>

            <HorizontalDivider className="mt-15 md:mt-20" />
        </section>
    );
}
