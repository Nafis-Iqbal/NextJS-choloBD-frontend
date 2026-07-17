"use client";

import { AuthApi } from "@/services/api";

import { HorizontalDivider } from "@/components/custom-elements/UIUtilities"
import { HotelServiceAdminModule } from "@/components/modular-components/dashboard/service-admin/HotelServiceAdminModule";
import { BusServiceAdminModule } from "@/components/modular-components/dashboard/service-admin/BusServiceAdminModule";
import { GuideServiceAdminModule } from "@/components/modular-components/dashboard/service-admin/GuideServiceAdminModule";
import { ActivityServiceAdminModule } from "@/components/modular-components/dashboard/service-admin/ActivityServiceAdminModule";

export default function AdminDashboard() {
    const { data: authResponse, isLoading: isAuthLoading } =
        AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;
    const currentUserServiceType = authResponse?.data?.userServiceType;

    if (isAuthLoading) {
        return (
            <section
                className="flex flex-col p-2 font-sans"
                id="service_admin_dashboard"
                style={{
                    backgroundColor: "var(--theme-section-bg)",
                    color: "var(--theme-text)",
                }}
            >
                <p className="theme-text-muted md:ml-4">Loading dashboard...</p>
            </section>
        );
    }

    if (!isAuthenticated || currentUserRole !== "SERVICE_ADMIN") {
        return null;
    }

    return (
        <section
            className="flex flex-col p-2 font-sans"
            id="service_admin_dashboard"
            style={{
                backgroundColor: "var(--theme-section-bg)",
                color: "var(--theme-text)",
            }}
        >
            <div className="md:ml-4 flex flex-col space-y-2">
                {currentUserServiceType === "HOTEL_BOOKING" ? (
                    <HotelServiceAdminModule />
                ) : currentUserServiceType === "TRANSPORT_SERVICE" ? (
                    <BusServiceAdminModule />
                ) : currentUserServiceType === "ACTIVITY_BOOKING" ? (
                    <ActivityServiceAdminModule />
                ) : currentUserServiceType === "GUIDE_SERVICE" ? (
                    <GuideServiceAdminModule />
                ) : null}
            </div>

            <HorizontalDivider className="border-green-500 mt-15 md:mt-20" />
        </section>
    );
}